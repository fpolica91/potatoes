/* eslint-disable camelcase */
import Vue from 'vue'
import Config from '~/botqaqi.config.js'

const state = () => ({
  address: {
    street: '',
    city: '',
    zip: '',
    country: ''
  },
  customer: {
    email: '',
    phone: '',
    customer_id: '',
    active: ''
  },
  subscriptions: {},
  headers: [
    {
      text: 'Invoice',
      value: 'invoice_id',
      sortable: false
    },
    {
      text: 'Date',
      value: 'created',
      sortable: false
    },
    {
      text: 'Amount',
      value: 'price',
      sortable: false
    },
    {
      text: 'Product ID',
      value: 'subscription',
      sortable: false
    },
    {
      text: 'Customer ID',
      value: 'customer',
      sortable: false
    },
    {
      text: 'Download PDF',
      value: 'invoice_pdf',
      sortable: false
    }
  ],
  items: []
})

const getters = {
}

const actions = {
  async getResources({ rootState, state, commit, dispatch }, payload) {
    try {
      if ((JSON.stringify(state.subscriptions) === '{}')) {
        await dispatch('setProductsObject')
        await dispatch('getCustomerInformation')
      } else {
        await dispatch('getCustomerInformation')
        await dispatch('setProductsObject')
      }
      await dispatch('setProductsObject')
      window.$nuxt.$loading.finish({ init: false, save: false, wait: false })
    } catch (err) {
      const errorMessage = err.response ? err.response.data : err.message
      commit('handleErrorMessage', errorMessage)
      window.$nuxt.$loading.finish({ init: false, save: false, wait: false })
    }
  },
  async handleSignup({ rootState, state, commit, dispatch }, payload) {
    const isPhoneValid = state.customer.phone.trim()
    if (isPhoneValid === '') {
      await commit('handleErrorMessage', 'Please Enter A Valid Phone Number')
      return
    }

    const { email, phone } = state.customer
    const { subscriptions } = state
    const { street, city, zip, country } = state.address
    const { puid } = rootState.auth.user
    const { paymentMethod } = payload
    window.$nuxt.$loading.start({ init: false, save: true })
    await this.$axios.post(`${Config.webhook.billing}/subscribe`, {
      email,
      phone,
      puid,
      paymentMethod,
      address: { street, city, zip, country },
      subscriptions
    })
      .then(async (response) => {
        console.log(response) // eslint-disable-line
        await dispatch('getCustomerInformation')
        await dispatch('setProductsObject')
        await commit('handleSuccessMessage', response.data)
      })
      .catch((err) => {
        const errorMessage = err.response ? err.response.data : err.message
        commit('handleErrorMessage', errorMessage)
        window.$nuxt.$loading.finish({ init: false, save: false, wait: false })
      })
  },
  handlePdfDownload({ rootState, state, commit, dispatch }, payload) {
    window.$nuxt.$loading.start({ init: false, save: true })
    const link = document.createElement('a')
    link.href = payload
    link.setAttribute('download', 'file.pdf')
    document.body.appendChild(link)
    link.click()
    setTimeout(() => {
      window.$nuxt.$loading.finish({ init: false, save: false })
    }, 4500)
  },
  async handleUpdate({ commit, rootState, state, dispatch, getters }, payload) {
    const isEmailValid = state.customer.email.trim()
    const isPhoneValid = state.customer.phone.trim()
    const isCustomerValid = state.customer.customer_id.trim()

    if (isCustomerValid === '') {
      await commit('handleErrorMessage', 'Unable To Verify Customer')
      return
    }

    if (isEmailValid === '' || isPhoneValid === '') {
      await commit('handleErrorMessage', 'Please Enter A Valid Email and Phone Number')
      return
    }
    if (payload) {
      const { paymentMethod } = payload
      const { puid } = rootState.auth.user
      const { address } = state
      const { email, phone } = state.customer
      const { subscriptions } = state
      window.$nuxt.$loading.start({ init: false, save: true })
      await this.$axios.put(`${Config.webhook.billing}/subscribe`, {
        email, phone, subscriptions, puid, address, paymentMethod
      }).then(async (response) => {
        await dispatch('getCustomerInformation')
        await dispatch('setProductsObject')
        await commit('handleSuccessMessage', response.data)
      })
        .catch((err) => {
          const errorMessage = err.response ? err.response.data : err.message
          commit('handleErrorMessage', errorMessage)
        })
    } else {
      console.log('same card') // eslint-disable-line
      const { puid } = rootState.auth.user
      const { address } = state
      const { email, phone } = state.customer
      const { subscriptions } = state
      window.$nuxt.$loading.start({ init: false, save: true })
      await this.$axios.put(`${Config.webhook.billing}/subscribe`, {
        email, phone, subscriptions, puid, address
      }).then(async (response) => {
        await dispatch('getCustomerInformation')
        await dispatch('setProductsObject')
        await commit('handleSuccessMessage', response.data)
      })
        .catch((err) => {
          const errorMessage = err.response ? err.response.data : err.message
          commit('handleErrorMessage', errorMessage)
          window.$nuxt.$loading.finish({ init: false, save: false, wait: false })
        })
    }
  },
  async handleSubmit({ commit, rootState, state, dispatch, getters }, payload) {
    const isSubscriptionSelected = Object.values(state.subscriptions)
      .filter(subscription => subscription.selected === true)
    const isAdressValid = Object.values(state.address).some(x => (x === null || x.trim() === ''))
    if (!isSubscriptionSelected.length && !state.customer.active) {
      await commit('handleErrorMessage', 'Please Select A Subscription')
      return
    }
    if (isAdressValid) {
      await commit('handleErrorMessage', 'Please Enter A Valid Billing Address')
    } else {
      try {
        if (state.customer.active) {
          await dispatch('handleUpdate', payload)
        } else {
          await dispatch('handleSignup', payload)
        }
        window.$nuxt.$loading.finish({ init: false, save: false })
      } catch (err) {
        const errorMessage = err.response ? err.response.data : err.message
        await commit('handleErrorMessage', errorMessage)
        window.$nuxt.$loading.finish({ init: false, save: false })
      }
    }
  },
  async setProductsObject({ rootState, state, commit, dispatch }) {
    try {
      const { puid } = rootState.auth.user
      const { customer } = state
      const customerID = !customer.customer_id ? '' : customer.customer_id
      const { data } = await this.$axios.get(`${Config.webhook.billing}/products?customerID=${customerID}&&practicePUID=${puid}`)
      const subscriptions = data[0]
      const orderedSubscriptions = {}
      Object.keys(subscriptions).sort().forEach((key) => {
        orderedSubscriptions[key] = subscriptions[key]
      })
      await commit('setUserProducts', orderedSubscriptions)
    } catch (err) {
      const errorMessage = err.response ? err.response.data : err.message
      commit('handleErrorMessage', errorMessage)
    }
  },
  async getCustomerInformation({ rootState, state, commit, dispatch }) {
    try {
      const { puid } = rootState.auth.user
      const doc = await this.$fireStore.collection('practice').doc(puid).get()
      const { subscriber } = await doc.data()
      const customer = {
        email: !subscriber.email ? '' : subscriber.email,
        phone: !subscriber.phone ? '' : subscriber.phone,
        customer_id: !subscriber.id ? '' : subscriber.id,
        active: !subscriber.active ? false : subscriber.active
      }

      await commit('setSubscriberForm', customer)
      if (subscriber.address) {
        await commit('setAddressForm', subscriber.address)
      }
      await dispatch('getCustomerInvoiceData')

      window.$nuxt.$loading.finish({ init: false, save: false, wait: false })
    } catch (err) {
      const errorMessage = err.response ? err.response.data : err.message
      commit('handleErrorMessage', errorMessage)
      window.$nuxt.$loading.finish({ init: false, save: false, wait: false })
    }
  },
  async getCustomerInvoiceData({ rootState, state, commit }) {
    const { customer_id } = state.customer
    if (customer_id) {
      const { data } = await this.$axios.get(`${Config.webhook.billing}/invoice`, {
        params: {
          customer: customer_id
        }
      })
      await commit('setTableItems', data)
    }
  },
  async cancelSubscription({ rootState, commit, state, dispatch }) {
    const confirmUnsubscribe = await this.$swal.fire({
      title: 'Are You sure?',
      icon: 'warning',
      text: `Are you sure you want to Cancel all Active Subscriptions?`,
      showCancelButton: true,
      confirmButtonText: 'Yes'
    })
    try {
      if (confirmUnsubscribe.value) {
        window.$nuxt.$loading.start({ init: false, save: true })
        const { puid } = rootState.auth.user
        const { customer_id } = state.customer
        await this.$axios.post(`${Config.webhook.billing}/unsubscribe`,
          { puid, customer_id })
        commit('handleSuccessMessage', 'Successfully Cancelled Active Subscriptions')
        await dispatch('getCustomerInformation')
        await dispatch('setProductsObject')
      }
    } catch (err) {
      const errorMessage = err.response ? err.response.data : err.message
      await commit('handleErrorMessage', errorMessage)
      window.$nuxt.$loading.finish({ init: false, save: false })
    }
  }
}

const mutations = {
  async handleErrorMessage(_, errorMessage) {
    await this.$swal.fire({
      title: 'Error',
      icon: 'error',
      text: errorMessage
    })
  },
  async setUserProducts(state, payload) {
    await Vue.set(state, 'subscriptions', payload)
  },
  async handleSuccessMessage(_, successMessage) {
    await this.$swal.fire({
      title: 'Success',
      icon: 'success',
      text: successMessage
    })
  },
  setAddress(state, payload) {
    state.address[payload.prop] = payload.value
  },
  async setSubscriberForm(state, payload) {
    await Vue.set(state, 'customer', payload)
  },
  setAddressForm(state, payload) {
    Object.assign(state.address, payload)
  },
  setCustomer(state, payload) {
    state.customer[payload.prop] = payload.value
  },
  setTableItems(state, payload) {
    Vue.set(state, 'items', payload)
  },
  setSubscriptionOptions(state, payload) {
    if (payload.value) {
      state.subscriptions[payload.prop].selected = true
    } else {
      state.subscriptions[payload.prop].selected = false
    }
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
