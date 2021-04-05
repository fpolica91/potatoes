import Vue from 'vue'

const state = () => ({
  user: {
    auth: false,
    agent: {
      name: '',
      projectId: '',
      context: {
        id: '',
        lifespan: 0,
        parameters: {}
      }
    },
    name: '',
    email: '',
    uid: '',
    company: '',
    cuid: '',
    ual: '',
    tokens: {
      access_token: '',
      refresh_token: ''
    }
  }
})

const getters = {
  isAuth(state) {
    return state.user.auth
  }
}

const actions = {
  async login({ state, commit, dispatch }, payload) {
    const googleAuthProvider = new this.$fireAuthObj.GoogleAuthProvider()
    googleAuthProvider.addScope('https://www.googleapis.com/auth/cloud-platform')

    await this.$fireAuth.signInWithPopup(googleAuthProvider)
      .then((response) => {
        if (payload.refresh) {
          response.refresh = true
          dispatch('getUser', response)
          dispatch('refreshToken')
        } else {
          dispatch('getInvite', response)
          dispatch('refreshToken')
        }
      }).catch((error) => {
        this.$swal.fire({
          title: 'Error',
          icon: 'error',
          text: `${error.message}`
        })
      })
  },
  async getInvite({ state, commit, dispatch }, payload) {
    await this.$fireStore.collection('invites').doc(payload.user.email)
      .get().then((doc) => {
        if (doc.exists) {
          dispatch('addInvitedUser', {
            invite: doc.data(),
            user: payload.user,
            tokens: {
              access_token: payload.credential.accessToken,
              refresh_token: payload.user.refreshToken
            }
          })
        } else {
          payload.refresh = false
          dispatch('getUser', payload)
        }
      }).catch((error) => {
        this.$swal.fire({
          title: 'Error',
          icon: 'error',
          text: error.message
        })
        console.log(error.message) // eslint-disable-line        
      })
  },
  async getUser({ state, commit, dispatch }, payload) {
    await this.$fireStore.collection('users').doc(payload.user.uid)
      .get().then((doc) => {
        if (doc.exists) {
          commit('setAuthIn', {
            auth: true,
            agent: doc.data().agent,
            name: doc.data().name,
            email: doc.data().email,
            uid: doc.data().uid,
            company: doc.data().company,
            cuid: doc.data().cuid,
            ual: doc.data().ual,
            tokens: {
              access_token: payload.credential.accessToken,
              refresh_token: payload.user.refreshToken
            }
          })

          if (!payload.refresh) this.$router.push('settings')
        } else {
          dispatch('addUser', {
            user: payload.user,
            tokens: {
              access_token: payload.credential.accessToken,
              refresh_token: payload.user.refreshToken
            }
          })
        }
      }).catch((error) => {
        this.$swal.fire({
          title: 'Error',
          icon: 'error',
          text: error.message
        })
        console.log(error.message) // eslint-disable-line        
      })
  },
  async addInvitedUser({ state, commit, dispatch }, payload) {
    await this.$fireStore.collection('users').doc(payload.user.uid)
      .set({
        name: payload.user.displayName,
        email: payload.user.email,
        uid: payload.user.uid,
        company: payload.invite.company,
        cuid: payload.invite.cuid,
        ual: payload.invite.ual
      }).then((doc) => {
        dispatch('deleteInvite', { user: payload.user })
        commit('setAuthIn', {
          auth: true,
          name: payload.user.displayName,
          email: payload.user.email,
          uid: payload.user.uid,
          company: payload.invite.company,
          cuid: payload.invite.cuid,
          ual: payload.invite.ual,
          tokens: payload.tokens
        })
        this.$router.push('settings')
      }).catch((error) => {
        this.$swal.fire({
          title: 'Error',
          icon: 'error',
          text: error.message
        })
        console.log(error.message) // eslint-disable-line
      })
  },
  async addUser({ state, commit, dispatch }, payload) {
    await this.$fireStore.collection('users').doc(payload.user.uid)
      .set({
        agent: {
          name: '',
          projectId: '',
          context: {
            id: '',
            lifespan: 0,
            parameters: {}
          }
        },
        name: payload.user.displayName,
        email: payload.user.email,
        uid: payload.user.uid,
        company: '',
        cuid: '',
        ual: 'Admin'
      }).then((doc) => {
        commit('setAuthIn', {
          auth: true,
          agent: {
            name: '',
            projectId: '',
            context: {
              id: '',
              lifespan: 0,
              parameters: {}
            }
          },
          name: payload.user.displayName,
          email: payload.user.email,
          uid: payload.user.uid,
          company: '',
          cuid: '',
          ual: 'Admin',
          tokens: payload.tokens
        })
        this.$router.push('settings')
      }).catch((error) => {
        this.$swal.fire({
          title: 'Error',
          icon: 'error',
          text: error.message
        })
        console.log(error.message) // eslint-disable-line
      })
  },
  async deleteInvite({ state, commit, dispatch }, payload) {
    await this.$fireStore.collection('invites').doc(payload.user.email)
      .delete().then((doc) => {
        console.log('Successfully Accepted Invite!') // eslint-disable-line
      }).catch((error) => {
        this.$swal.fire({
          title: 'Error',
          icon: 'error',
          text: error.message
        })
        console.log(error.message) // eslint-disable-line
      })
  },
  refreshToken({ state, commit, dispatch }, payload) {
    setTimeout(() => {
      dispatch('login', { refresh: true })
    }, 1800000)
  },
  async logout({ commit, dispatch }, payload) {
    await this.$fireAuth.signOut().then((response) => {
      commit('setAuthOut')
      commit('settings/clearCompany', null, { root: true })
      commit('settings/clearUserHistory', null, { root: true })
      commit('botqaqi/clearFlowSequence', { confirm: false }, { root: true })
      commit('botqaqi/clearFlowGroup', null, { root: true })
      commit('botqaqi/clearAgent', null, { root: true })
    }).catch((error) => {
      this.$swal.fire({
        title: 'Error',
        icon: 'error',
        text: `${error.message}`
      })
    })
  }
}

const mutations = {
  setAuthIn(state, payload) {
    Vue.set(state, 'user', payload)
  },
  setAuthOut(state) {
    const user = {
      auth: false,
      agent: {
        name: '',
        projectId: '',
        context: {
          id: '',
          lifespan: 0,
          parameters: {}
        }
      },
      name: '',
      email: '',
      uid: '',
      company: '',
      cuid: '',
      ual: '',
      tokens: {
        access_token: '',
        refresh_token: ''
      }
    }

    Vue.set(state, 'user', user)
  },
  setAuthTokens(state, payload) {
    Vue.set(state.users, 'tokens', payload)
  },
  setAgent(state, payload) {
    Vue.set(state, 'agent', payload)
  },
  setCompany(state, payload) {
    state.user.company = payload.company
    state.user.cuid = payload.cuid
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
