import Vue from 'vue'

const state = () => ({
  company: {
    name: '',
    website: '',
    cuid: '',
    agents: {},
    users: [{
      name: '',
      email: '',
      ual: ''
    }]
  },
  userHistory: [],
  isDirty: false
})

const getters = {
  company(state) {
    return state.company
  },
  isAdmin(state, getters, rootState) {
    return rootState.auth.user.ual === 'Admin'
  },
  isUserValid(state) {
    const user = state.company.users.find((user) => {
      return user.name.trim() === '' || user.email.trim() === '' || user.ual.trim() === ''
    })

    if (user === undefined) return true
    else return false
  },
  isDirty(state) {
    return state.isDirty ? 'settings__save--display' : ''
  }
}

const actions = {
  async getSettings({ state, commit, dispatch, rootState }, payload) {
    if (rootState.auth.user.cuid !== '') {
      await this.$fireStore.collection('company').doc(rootState.auth.user.cuid)
        .get().then((doc) => {
          if (doc.exists) {
            commit('setSettings', doc.data())
          }
        }).catch((error) => {
          this.$swal.fire({
            title: 'Error',
            icon: 'error',
            text: error.message
          })
          console.log(error.message) // eslint-disable-line        
        })
    }

    if (state.company.users.length === 1 &&
      state.company.users[0].name === '' &&
      state.company.users[0].email === '' &&
      state.company.users[0].ual === '') {
      commit('setAdminUser', {
        name: rootState.auth.user.name,
        email: rootState.auth.user.email,
        ual: 'Admin'
      })
    }
  },
  async saveSettings({ state, getters, commit, dispatch }, payload) {
    if (state.company.name.trim() === '') {
      this.$swal.fire({
        title: 'Warning',
        icon: 'warning',
        text: 'Please Enter Company Name!'
      })
      return
    } else if (!getters.isUserValid) {
      this.$swal.fire({
        title: 'Warning',
        icon: 'warning',
        text: 'Please Enter Full Name, Email, and Access Level!'
      })
      return
    } else if (state.company.users.length === 1 && state.company.users[0].ual !== 'Admin') {
      this.$swal.fire({
        title: 'Warning',
        icon: 'warning',
        text: 'At Least 1 Admin User is Required!'
      })
      return
    }

    window.$nuxt.$loading.start({ init: false, save: true })
    if (state.company.cuid === '') {
      await this.$fireStore.collection('company')
        .add(state.company).then(async (doc) => {
          await dispatch('setCompany', { prop: 'cuid', value: doc.id })
          await dispatch('setInvites')
          await dispatch('setRevokes')
          commit('setDirty', false)
        }).catch((error) => {
          this.$swal.fire({
            title: 'Error',
            icon: 'error',
            text: error.message
          })
          console.log(error.message) // eslint-disable-line
          window.$nuxt.$loading.finish({ init: false, save: false })
        })
    } else {
      await this.$fireStore.collection('company').doc(state.company.cuid)
        .set(state.company)
        .then(async (doc) => {
          await dispatch('setInvites')
          await dispatch('setRevokes')
          commit('setDirty', false)
        }).catch((error) => {
          this.$swal.fire({
            title: 'Error',
            icon: 'error',
            text: error.message
          })
          console.log(error.message) // eslint-disable-line
          window.$nuxt.$loading.finish({ init: false, save: false })
        })
    }
  },
  async setCompany({ state, commit, dispatch, rootState }, payload) {
    await this.$fireStore.collection('users').doc(rootState.auth.user.uid)
      .update({
        company: state.company.name,
        cuid: payload.value
      })
      .then((doc) => {
        console.log('Successfully Updated User!') // eslint-disable-line
        window.$nuxt.$loading.finish({ init: false, save: false })
      }).catch((error) => {
        this.$swal.fire({
          title: 'Error',
          icon: 'error',
          text: error.message
        })
        console.log(error.message) // eslint-disable-line
        window.$nuxt.$loading.finish({ init: false, save: false })
      })

    await this.$fireStore.collection('company').doc(payload.value)
      .update({ cuid: payload.value })
      .then((doc) => {
        commit('setCompany', { prop: 'cuid', value: payload.value })
        commit('auth/setCompany', {
          company: state.company.name,
          cuid: state.company.cuid
        }, { root: true })
      }).catch((error) => {
        this.$swal.fire({
          title: 'Error',
          icon: 'error',
          text: error.message
        })
        console.log(error.message) // eslint-disable-line
        window.$nuxt.$loading.finish({ init: false, save: false })
      })
  },
  async setInvites({ state, commit, dispatch, rootState }, payload) {
    const batch = this.$fireStore.batch()
    const invites = state.company.users.filter((user) => {
      return user.email !== rootState.auth.user.email
    })

    invites.forEach((invite) => {
      const docRef = this.$fireStore.collection('invites').doc(invite.email)
      invite.company = state.company.name
      invite.cuid = state.company.cuid

      batch.set(docRef, invite)
    })

    await batch.commit().then((response) => {
      console.log('Successfully Sent Invites!') // eslint-disable-line
    }).catch((error) => {
      this.$swal.fire({
        title: 'Error',
        icon: 'error',
        text: error.message
      })
      window.$nuxt.$loading.finish({ init: false, save: false })
    })
  },
  async setRevokes({ state, commit, dispatch, rootState }, payload) {
    const batch = this.$fireStore.batch()
    const currentUsers = []
    const revokedUsers = []

    await this.$fireStore.collection('users')
      .where('cuid', '==', state.company.cuid)
      .get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          currentUsers.push(doc.data())
        })
      }).catch((error) => {
        this.$swal.fire({
          title: 'Error',
          icon: 'error',
          text: error.message
        })
        window.$nuxt.$loading.finish({ init: false, save: false })
      })

    state.userHistory.forEach((previousUser) => {
      const foundUser = state.company.users.find((currentUser) => {
        return currentUser.email === previousUser.email
      })

      if (foundUser === undefined) {
        const revokedUser = currentUsers.find((currentUser) => {
          return currentUser.email === previousUser.email
        })
        if (revokedUser !== undefined) revokedUsers.push(revokedUser)
      }
    })

    revokedUsers.forEach((revokedUser) => {
      const docRef = this.$fireStore.collection('users').doc(revokedUser.uid)
      batch.delete(docRef)
    })

    await batch.commit().then((response) => {
      this.$swal.fire({
        title: 'Success',
        icon: 'success',
        text: `Successfully Updated Settings!`
      })
      window.$nuxt.$loading.finish({ init: false, save: false })
    }).catch((error) => {
      this.$swal.fire({
        title: 'Error',
        icon: 'error',
        text: error.message
      })
      window.$nuxt.$loading.finish({ init: false, save: false })
    })
  },
  async resetSettings({ state, commit, dispatch, rootState }, payload) {
    await commit('clearCompany')
    await commit('clearUserHistory')
  }
}

const mutations = {
  setDirty(state, payload) {
    state.isDirty = payload
  },
  setSettings(state, payload) {
    Vue.set(state, 'company', payload)
    Vue.set(state, 'userHistory', payload.users)
  },
  setCompany(state, payload) {
    Vue.set(state.company, payload.prop, payload.value)
  },
  setUser(state, payload) {
    Vue.set(state.company.users[payload.id], payload.prop, payload.value)
  },
  setAdminUser(state, payload) {
    Vue.set(state.company.users, 0, payload)
  },
  addUser(state, payload) {
    state.company.users.push({
      name: '',
      email: '',
      ual: ''
    })
  },
  deleteUser(state, payload) {
    if (state.company.users.length === 1) {
      this.$swal.fire({
        title: 'Warning',
        icon: 'warning',
        text: 'At Least 1 Admin User is Required!'
      })
      return
    }

    state.company.users.splice(payload.id, 1)
  },
  clearCompany(state, payload) {
    const defaultCompany = {
      name: '',
      website: '',
      cuid: '',
      agents: {},
      users: [{
        name: '',
        email: '',
        ual: ''
      }]
    }

    Vue.set(state, 'company', defaultCompany)
  },
  clearUserHistory(state, payload) {
    const defaultUserHistory = []
    Vue.set(state, 'userHistory', defaultUserHistory)
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
