import Vue from 'vue'
import Config from '~/botqaqi.config.js'

const state = () => ({
  // Tabs
  tab: 'Config',
  // Editor
  agent: {
    selected: {
      name: '',
      projectId: ''
    },
    names: [],
    options: [],
    context: {
      id: '',
      lifespan: 0,
      parameters: [['', '']]
    }
  },
  isAgentDirty: false,
  isFlowsequenceDirty: false,
  flowSequence: {
    included: false,
    title: {
      current: '',
      previous: ''
    },
    description: '',
    exchanges: [{
      intent: '',
      userSays: '',
      botResponses: [{
        response: '',
        results: 'N/A'
      }],
      results: {
        intent: 'N/A',
        response: 'N/A',
        summary: 'N/A'
      }
    }],
    results: {
      intent: 'N/A',
      response: 'N/A',
      summary: 'N/A'
    }
  },
  flowSequenceIntents: [],
  flowSequenceShuffle: false,
  flowGroup: {
    selected: {
      included: false,
      name: '',
      sequences: [],
      results: {
        intent: 'N/A',
        response: 'N/A',
        summary: 'N/A'
      }
    },
    options: []
  },
  showEditor: false,
  // Table
  showAllFlowGroups: false,
  flowGroups: [],
  flowGroupsPaginate: {
    page: 1,
    length: 0,
    limit: 50,
    cursors: {
    }
  },
  editedIndex: -1,
  editedItem: {
    included: false,
    name: '',
    sequences: [],
    results: {
      intent: 'N/A',
      response: 'N/A',
      summary: 'N/A'
    }
  },
  defaultItem: {
    included: false,
    name: '',
    sequences: [],
    results: {
      intent: 'N/A',
      response: 'N/A',
      summary: 'N/A'
    }
  },
  headers: [
    {
      text: 'Included',
      value: 'included',
      width: '56px',
      sortable: false
    },
    {
      text: 'Conversation Group',
      value: 'name',
      sortable: false
    },
    {
      text: 'Test Intent',
      value: 'intent',
      width: '56px',
      sortable: false
    },
    {
      text: 'Test Response',
      value: 'response',
      width: '56px',
      sortable: false
    },
    // {
    //   text: 'Test Results',
    //   value: 'summary',
    //   width: '56px',
    //   sortable: false
    // },
    {
      text: 'Actions',
      value: 'actions',
      width: '56px',
      sortable: false
    }
  ],
  loading: true,
  showTableEditor: false,
  search: '',
  searchFilter: {
    value: '',
    options: [
      'included',
      'flowGroup',
      'testResults'
    ]
  },
  searchParams: {
    searchParams: false,
    searchBy: '',
    searchOp: '',
    searchTerm: ''
  },
  api: Config.api
})

const getters = {
  isAgentDirty(state) {
    return state.isAgentDirty ? 'botqaqi__settings-save--display' : ''
  },
  isAgentNameValid(state) {
    return state.agent.selected.name !== '' && state.agent.selected.projectId !== ''
  },
  isAgentContextValid(state) {
    const id = state.agent.context.id.trim()
    const parameter = state.agent.context.parameters.find((parameter) => {
      return parameter[0].trim() === '' || parameter[1].trim() === ''
    })

    if (id === '') return true
    else if (parameter === undefined) return true
    else return false
  },
  isFlowsequenceDirty(state) {
    return state.isFlowsequenceDirty ? 'botqaqi__flow-sequence-save--display' : ''
  },
  isTabConfig(state) {
    return state.tab === 'Config'
  },
  isTabBotQaQi(state) {
    return state.tab === 'BotQaQi'
  }
}

const actions = {
  filterFlowGroups({ state, commit, dispatch }, payload) {
    commit('setShowAllFlowGroups', !state.showAllFlowGroups)
    dispatch('getFlowGroups', { load: true })
  },
  async getFlowGroups({ state, commit, rootState }, payload) {
    const flowGroup = {
      selected: {},
      options: []
    }
    const flowGroups = []

    if (payload.load) window.$nuxt.$loading.start({ init: false, save: true })

    if (state.showAllFlowGroups) {
      await this.$fireStore.collection('company')
        .doc(rootState.auth.user.cuid)
        .collection(state.agent.selected.name)
        .get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            flowGroup.options.push(doc.id)
            flowGroups.push(doc.data())
          })
          flowGroup.options.push('Add Group')
        }).catch((error) => {
          this.$swal.fire({
            title: 'Error',
            icon: 'error',
            text: `${error.message}`
          })
        })
    } else {
      await this.$fireStore.collection('company')
        .doc(rootState.auth.user.cuid)
        .collection(state.agent.selected.name)
        .where('uid', '==', rootState.auth.user.uid)
        .get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            flowGroup.options.push(doc.id)
            flowGroups.push(doc.data())
          })
          flowGroup.options.push('Add Group')
        }).catch((error) => {
          this.$swal.fire({
            title: 'Error',
            icon: 'error',
            text: `${error.message}`
          })
        })
    }

    await commit('setFlowGroups', { flowGroup, flowGroups })
    if (payload.load) window.$nuxt.$loading.finish({ init: false, save: false })
  },
  async getAgents({ state, commit, dispatch, rootState }, payload) {
    window.$nuxt.$loading.start({ init: false, save: true })
    await this.$axios.post(state.api, { type: 'getAgents', tokens: rootState.auth.user.tokens })
      .then((response) => {
        if (response.data.status === 'Success') {
          commit('setAgentOptions', response.data.data)
          commit('setAgentDefaultSelection', rootState.auth.user.agent)
        } else {
          this.$swal.fire({
            title: 'Error',
            icon: 'error',
            text: response.data.message
          })
        }
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
  async getFlowSequenceIntents({ state, commit, rootState }, payload) {
    window.$nuxt.$loading.start({ init: false, save: true })
    await this.$axios.post(state.api, {
      type: 'getIntents',
      project: {
        agent: state.agent.selected.name,
        id: state.agent.selected.projectId
      },
      tokens: rootState.auth.user.tokens
    })
      .then((response) => {
        commit('setFlowSequenceIntents', response.data.data)
      }).catch((error) => {
        this.$swal.fire({
          title: 'Error',
          icon: 'error',
          text: error.message
        })
        window.$nuxt.$loading.finish({ init: false, save: false })
      })
  },
  async setServiceAccount({ state, commit, rootState }, payload) {
    await this.$axios.post(state.api, {
      type: 'setServiceAccount',
      project: {
        agent: state.agent.selected.name,
        id: state.agent.selected.projectId,
        cuid: rootState.auth.user.cuid
      },
      tokens: rootState.auth.user.tokens
    })
      .then((response) => {
        if (response.data.status === 'Failed') {
          this.$swal.fire({
            title: 'Error',
            icon: 'error',
            text: response.data.message
          })
        } else {
          console.log('Successfully Set Service Account!') // eslint-disable-line
        }
        window.$nuxt.$loading.finish({ init: false, save: false })
      })
      .catch((error) => {
        this.$swal.fire({
          title: 'Error',
          icon: 'error',
          text: error.message
        })
        window.$nuxt.$loading.finish({ init: false, save: false })
      })
  },
  async saveAgentSettings({ state, getters, commit, dispatch, rootState }, payload) {
    if (!getters.isAgentNameValid || !getters.isAgentContextValid) {
      this.$swal.fire({
        title: 'Warning',
        icon: 'warning',
        text: 'Please Select Agent and Enter Valid Context Values.'
      })
      return
    }

    window.$nuxt.$loading.start({ init: false, save: true })
    await this.$fireStore.collection('company').doc(rootState.auth.user.cuid)
      .update({
        [`agents.${state.agent.selected.name}`]: {
          name: state.agent.selected.name,
          projectId: state.agent.selected.projectId
        }
      })
      .then((doc) => {
        dispatch('saveUserAgentSettings')
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
  async saveUserAgentSettings({ state, getters, commit, dispatch, rootState }, payload) {
    const agent = {
      name: state.agent.selected.name,
      projectId: state.agent.selected.projectId,
      context: {
        id: state.agent.context.id,
        lifespan: state.agent.context.lifespan,
        parameters: {}
      }
    }

    state.agent.context.parameters.forEach((parameter) => {
      if (parameter[0].trim() === '') {
        agent.context.parameters.empty = null
      } else {
        agent.context.parameters[parameter[0]] = parameter[1]
      }
    })

    await this.$fireStore.collection('users').doc(rootState.auth.user.uid)
      .update({ agent }).then((doc) => {
        this.$swal.fire({
          title: 'Success',
          icon: 'success',
          text: `Successfully Updated Config!`
        })
        commit('auth/setAgent', agent, { root: true })
        commit('setAgentDirty', false)
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
  },
  async setTab({ state, getters, commit, dispatch, rootState }, payload) {
    if (payload === 'BotQaQi' && state.agent.selected.name === '') {
      this.$swal.fire({
        title: 'Warning',
        icon: 'warning',
        text: `Please Select an Agent and Save Config!`
      })
      commit('setTab', payload)
    } else if (payload === 'BotQaQi' && state.agent.selected.name !== '') {
      commit('setTab', payload)
      await dispatch('getFlowGroups', { load: false })
      await dispatch('getFlowSequenceIntents')
      await dispatch('setServiceAccount')
    } else {
      commit('setTab', payload)
    }
  },
  async testFlowSequences({ state, commit, dispatch, rootState }) {
    const payload = (function () {
      const payloadData = {
        type: 'initTest',
        data: {
          flowGroups: JSON.parse(JSON.stringify(state.flowGroups)),
          scheduled: false
        },
        project: {
          agent: {
            name: state.agent.selected.name,
            context: {
              id: state.agent.context.id,
              lifespan: state.agent.context.lifespan,
              parameters: {}
            }
          },
          id: state.agent.selected.projectId,
          cuid: rootState.auth.user.cuid
        },
        tokens: rootState.auth.user.tokens
      }

      // Sort Flow Group Data
      payloadData.data.flowGroups.forEach((flowGroup) => {
        flowGroup.sequences = flowGroup.sequences.filter((sequence) => {
          return sequence.included === true
        })
        flowGroup.sequences = flowGroup.sequences.sort((a, b) => {
          const nameA = a.title.current.toUpperCase()
          const nameB = b.title.current.toUpperCase()
          if (nameA < nameB) {
            return -1
          }
          if (nameA > nameB) {
            return 1
          }
          return 0
        })
      })

      // Construct Context Parameters
      state.agent.context.parameters.forEach((parameter) => {
        if (parameter[0].trim() === '') {
          payloadData.project.agent.context.parameters.empty = null
        } else {
          payloadData.project.agent.context.parameters[parameter[0]] = parameter[1]
        }
      })

      return payloadData
    }())
    const confirmAction = await this.$swal.fire({
      title: 'Are You sure?',
      icon: 'warning',
      text: 'Are you sure you want to Run Test?',
      showCancelButton: true,
      confirmButtonText: 'Yes'
    })

    if (confirmAction.value === true) {
      window.$nuxt.$loading.start({ init: false, save: true })
      await dispatch('saveFlowSettings', { alert: false })
      await this.$axios.post(state.api, payload)
        .then((response) => {
          dispatch('getFlowGroups', { load: true })
          commit('clearFlowSequence', { confirm: false })

          if (response.data.status === 'Failed') {
            this.$swal.fire({
              title: 'Error',
              icon: 'error',
              text: response.data.message
            })
          } else {
            this.$swal.fire({
              title: 'Success',
              icon: 'success',
              text: `Successfully Completed Conversation Test!`
            })
          }

          window.$nuxt.$loading.finish({ init: false, save: false })
        })
        .catch((error) => {
          this.$swal.fire({
            title: 'Error',
            icon: 'error',
            text: error.message
          })
          window.$nuxt.$loading.finish({ init: false, save: false })
        })
    }
  },
  async saveFlowSequence({ state, commit, dispatch, rootState }, payload) {
    let flowSequence, flowSequenceId
    const flowGroupSequences = state.flowGroup.selected.sequences
    const flowGroup = this.$fireStore.collection('company')
      .doc(rootState.auth.user.cuid)
      .collection(state.agent.selected.name)

    if (state.flowGroup.selected.name !== undefined && state.flowGroup.selected.name !== '') {
      flowSequence = Object.assign({}, state.flowSequence)
      flowSequenceId = flowGroupSequences.findIndex((sequence) => {
        return (sequence.title.current === flowSequence.title.current || sequence.title.current === flowSequence.title.previous)
      })
    } else {
      this.$swal.fire({
        title: 'Warning',
        icon: 'warning',
        text: `Please Select a Flow Group!`
      })
      return
    }

    flowSequence.title.previous = flowSequence.title.current
    flowSequence.exchanges.forEach((exchange) => {
      if (exchange.intent === undefined) exchange.intent = ''
    })
    if (flowSequenceId > -1) flowGroupSequences[flowSequenceId] = flowSequence
    else flowGroupSequences.push(flowSequence)

    window.$nuxt.$loading.start({ init: false, save: true })
    await flowGroup.doc(state.flowGroup.selected.name)
      .update({ sequences: flowGroupSequences })
      .then(async () => {
        this.$swal.fire({
          title: 'Success',
          icon: 'success',
          text: `Successfully Updated Conversation!`
        })
        await commit('setFlowSequence', 'updatePrevious')
        await dispatch('getFlowGroups', { load: true })
        await commit('setFlowsequenceDirty', false)
        window.$nuxt.$loading.finish({ init: false, save: false })
      }).catch(async (error) => {
        if (error.message.includes('No document to update')) {
          await flowGroup.doc(state.flowGroup.selected.name)
            .set({
              included: false,
              name: state.flowGroup.selected.name,
              sequences: flowGroupSequences,
              results: {
                intent: 'N/A',
                response: 'N/A',
                summary: 'N/A'
              },
              uid: rootState.auth.user.uid
            })
            .then(async () => {
              await dispatch('getFlowGroups', { load: true })
              this.$swal.fire({
                title: 'Success',
                icon: 'success',
                text: `Successfully Saved Conversation!`
              })
              await commit('setFlowSequence', 'updatePrevious')
              await commit('setFlowsequenceDirty', false)
            }).catch((error) => {
              this.$swal.fire({
                title: 'Error',
                icon: 'error',
                text: `${error.message}`
              })
            })
        } else {
          this.$swal.fire({
            title: 'Error',
            icon: 'error',
            text: `${error.message}`
          })
        }
        window.$nuxt.$loading.finish({ init: false, save: false })
      })
  },
  async duplicateFlowSequence({ state, commit, dispatch }, payload) {
    if (state.flowGroup.selected.name !== undefined && state.flowGroup.selected.name !== '') {
      const confirmAction = await this.$swal.fire({
        title: 'Are You sure?',
        icon: 'warning',
        text: 'Are you sure you want to Duplicate this Conversation?',
        showCancelButton: true,
        confirmButtonText: 'Yes'
      })

      if (confirmAction.value) {
        await commit('duplicateFlowSequence')
        await dispatch('saveFlowSequence')
        await commit('clearFlowSequence', { confirm: false })
      }
    } else {
      this.$swal.fire({
        title: 'Warning',
        icon: 'warning',
        text: `Please Select a Flow Group!`
      })
    }
  },
  async branchFlowSequence({ state, commit, dispatch }, payload) {
    const confirmAction = await this.$swal.fire({
      title: 'Are You sure?',
      icon: 'warning',
      text: 'Are you sure you want to create a Branch?',
      showCancelButton: true,
      confirmButtonText: 'Yes'
    })

    if (confirmAction.value) {
      await commit('branchFlowSequence', payload)
      await dispatch('saveFlowSequence')
      await commit('clearFlowSequence', { confirm: false })
    }
  },
  async getFlowExchangeTranscript({ state, commit, dispatch, rootState }, payload) {
    const swal = this.$swal.mixin({
      customClass: {
        confirmButton: 'swal2-confirm swal2-styled',
        cancelButton: 'swal2-cancel swal2-styled'
      },
      buttonsStyling: true
    })
    let transcript = ''
    const styles = `<style>
      .transcript {
        display: flex;
        flex-direction: column;
      }
      .transcript-line {
        display: flex;
      }
      .transcript-group {
        display: flex;
      }
      .transcript-group-item {
        text-align: left;
        padding: 0 0 16px 0;
      }
    </style>`
    const query = `<div class="transcript-line"><p><strong>User Says:</strong> ${payload.transcript.query}<p></div>`
    const responses = [
      `<div class="transcript-line">
      <p><strong>Bot Response:</strong></p>
      </div>`,
      '<div class="transcript-group"><ul>'
    ]
    const intent = `<div class="transcript">
    <div class="transcript-line"><p><strong>Intent:</strong> ${payload.transcript.intent}<p></div>`
    const outputContexts = [
      `<div class="transcript-line">
      <p><strong>Output Contexts:</strong></p>
      </div>`,
      '<div class="transcript-group"><ul>'
    ]
    const parameters = [
      `<div class="transcript-line">
      <p><strong>Parameters:</strong></p>
      </div>`,
      '<div class="transcript-group"><ul>'
    ]

    // Add Responses
    payload.transcript.response.forEach((response) => {
      responses.push(`<li class="transcript-group-item">${response}</li>`)
    })
    responses.push('</ul></div>')

    // Add Output Contexts
    payload.transcript.outputContexts.forEach((context) => {
      outputContexts.push(`<li class="transcript-group-item">${context}</li>`)
    })
    outputContexts.push('</ul></div>')

    // Add Parameters
    Object.keys(payload.transcript.parameters).forEach((parameter) => {
      parameters.push(`<li class="transcript-group-item">${parameter}:
      ${payload.transcript.parameters[parameter]}</li>`)
    })
    parameters.push('</ul></div>')

    // Add Closing Tag
    responses.push('</div>')

    // Compile HTML
    transcript = styles + query + responses.join(' ') + intent + outputContexts.join(' ') + parameters.join(' ')

    await swal.fire({
      title: '<strong>Transcript</strong>',
      icon: '',
      html: `${transcript}`,
      showCloseButton: false,
      showCancelButton: true,
      focusConfirm: false,
      confirmButtonText: 'AutoFix',
      confirmButtonAriaLabel: 'AutoFix',
      cancelButtonText: 'Close',
      cancelButtonAriaLabel: 'Close',
      reverseButtons: true
    }).then((result) => {
      if (result.value) {
        commit('setFlowExchangeTranscript', payload)
      }
    })
  },
  async saveFlowSettings({ state, commit, dispatch, rootState }, payload) {
    const batch = this.$fireStore.batch()
    const collection = this.$fireStore.collection('company')
      .doc(rootState.auth.user.cuid)
      .collection(state.agent.selected.name)

    window.$nuxt.$loading.start({ init: false, save: true })

    state.flowGroups.forEach((group) => {
      batch.update(collection.doc(group.name), {
        included: group.included,
        sequences: group.sequences
      })
    })

    await batch.commit()
      .then(async (response) => {
        if (payload.alert) {
          this.$swal.fire({
            title: 'Success',
            icon: 'success',
            text: `Successfully Updated Settings!`
          })
          await dispatch('getFlowGroups', { load: true })
          window.$nuxt.$loading.finish({ init: false, save: false })
        }
      }).catch((error) => {
        this.$swal.fire({
          title: 'Error',
          icon: 'error',
          text: error.message
        })
        window.$nuxt.$loading.finish({ init: false, save: false })
      })
  },
  async deleteFlowGroup({ state, commit, dispatch, rootState }, payload) {
    const confirmAction = await this.$swal.fire({
      title: 'Are You sure?',
      icon: 'warning',
      text: 'Are you sure you want to delete this Flow Group?',
      showCancelButton: true,
      confirmButtonText: 'Yes'
    })

    if (confirmAction.value === true) {
      window.$nuxt.$loading.start({ init: false, save: true })
      await this.$fireStore.collection('company')
        .doc(rootState.auth.user.cuid)
        .collection(state.agent.selected.name)
        .doc(payload.name)
        .delete()
        .then(async () => {
          await dispatch('getFlowGroups', { load: true })
          this.$swal.fire({
            title: 'Success',
            icon: 'success',
            text: `Successfully Updated Conversation!`
          })
          window.$nuxt.$loading.finish({ init: false, save: false })
        }).catch((error) => {
          this.$swal.fire({
            title: 'Error',
            icon: 'error',
            text: `${error.message}`
          })
          window.$nuxt.$loading.finish({ init: false, save: false })
        })
    }
  },
  async deleteFlowSequence({ state, commit, dispatch, rootState }, payload) {
    let flowGroupSequences

    if (state.flowSequence.title.current.trim() === '' || state.flowGroup.selected.name === undefined ||
       state.flowGroup.selected.name === '') {
      this.$swal.fire({
        title: 'Warning',
        icon: 'warning',
        text: `Missing Title and/or Flow Group!`
      })
    } else {
      const confirmAction = await this.$swal.fire({
        title: 'Are You sure?',
        icon: 'warning',
        text: 'Are you sure you want to Delete this Conversation?',
        showCancelButton: true,
        confirmButtonText: 'Yes'
      })

      if (confirmAction.value === true) {
        flowGroupSequences = state.flowGroup.selected.sequences.filter((sequence) => {
          return (sequence.title.current !== state.flowSequence.title.current)
        })

        window.$nuxt.$loading.start({ init: false, save: true })
        await this.$fireStore.collection('company')
          .doc(rootState.auth.user.cuid)
          .collection(state.agent.selected.name)
          .doc(state.flowGroup.selected.name)
          .update({
            sequences: flowGroupSequences
          })
          .then(async () => {
            await dispatch('resetFlowSequence')
            await dispatch('getFlowGroups', { load: true })
            this.$swal.fire({
              title: 'Success',
              icon: 'success',
              text: `Successfully Updated Conversation!`
            })
            window.$nuxt.$loading.finish({ init: false, save: false })
          }).catch((error) => {
            this.$swal.fire({
              title: 'Error',
              icon: 'error',
              text: `${error.message}`
            })
            window.$nuxt.$loading.finish({ init: false, save: false })
          })
      }
    }
  },
  async resetFlowSequence({ state, commit, dispatch }, payload) {
    await commit('clearFlowGroup')
    await commit('clearFlowSequence', { confirm: false })
  },
  async refeshFlowGroups({ state, commit, dispatch }, payload) {
    window.$nuxt.$loading.start({ init: false, save: true })
    await dispatch('resetFlowSequence')
    await dispatch('getFlowGroups', { load: true })
    window.$nuxt.$loading.finish({ init: false, save: false })
    this.$swal.fire({
      title: 'Success',
      icon: 'success',
      text: `Successfully Reloaded Sequences!`
    })
  }
}

const mutations = {
  setTab(state, payload) {
    state.tab = payload
  },
  setAgentDirty(state, payload) {
    state.isAgentDirty = payload
  },
  setFlowsequenceDirty(state, payload) {
    state.isFlowsequenceDirty = payload
  },
  setContext(state, payload) {
    if (payload.prop === 'parameters') {
      Vue.set(state.agent.context.parameters[payload.id], payload.value.id, payload.value.value)
    } else {
      Vue.set(state.agent.context, payload.prop, payload.value)
    }
  },
  addParameter(state, payload) {
    state.agent.context.parameters.push(['', ''])
  },
  deleteParameter(state, payload) {
    state.agent.context.parameters.splice(payload.id, 1)
  },
  setAgentSelection(state, payload) {
    const agent = state.agent.options.find((agentOption) => {
      return agentOption.name === payload
    })

    if (agent !== undefined) Vue.set(state.agent, 'selected', agent)
  },
  setAgentDefaultSelection(state, payload) {
    const context = {
      id: payload.context.id,
      lifespan: payload.context.lifespan,
      parameters: []
    }
    const agent = state.agent.options.find((agentOption) => {
      return agentOption.name === payload.name
    })

    Object.keys(payload.context.parameters).forEach((parameter) => {
      if (parameter === 'empty') context.parameters.push(['', ''])
      else context.parameters.push([parameter, payload.context.parameters[parameter]])
    })

    if (agent !== undefined) {
      Vue.set(state.agent, 'selected', agent)
      Vue.set(state.agent, 'context', context)
    }
  },
  setAgentOptions(state, payload) {
    state.agent.names = payload.names
    state.agent.options = payload.options
  },
  setShowAllFlowGroups(state, payload) {
    state.showAllFlowGroups = payload
  },
  setFlowGroups(state, payload) {
    const flowGroups = payload.flowGroups
    const flowGroupOptions = payload.flowGroup.options

    flowGroups.forEach((flowGroup) => {
      flowGroup.sequences.sort((a, b) => {
        const nameA = a.title.current.toUpperCase()
        const nameB = b.title.current.toUpperCase()
        if (nameA < nameB) {
          return -1
        }
        if (nameA > nameB) {
          return 1
        }
        return 0
      })
    })

    state.flowGroups = flowGroups
    state.flowGroup.options = flowGroupOptions
  },
  setFlowSequence(state, payload) {
    if (payload === 'updatePrevious') {
      state.flowSequence.title.previous = state.flowSequence.title.current
    } else if (payload.prop === 'title') {
      state.flowSequence.title.current = payload.value
    } else if (payload.prop === 'description') {
      state.flowSequence.description = payload.value
    }
  },
  setflowSequenceIntent(state, payload) {
    state.flowSequence.exchanges[payload.id].intent = payload.value
  },
  setFlowSequenceIntents(state, payload) {
    state.flowSequenceIntents = payload
  },
  setFlowSequenceShuffle(state, payload) {
    state.flowSequenceShuffle = !state.flowSequenceShuffle
    window.scrollTo(0, 0)
  },
  async setFlowExchange(state, payload) {
    if (payload.prop === 'exchange' && payload.value === 'delete') {
      const confirmAction = await this.$swal.fire({
        title: 'Are You sure?',
        icon: 'warning',
        text: 'Are you sure you want to delete this Exchange?',
        showCancelButton: true,
        confirmButtonText: 'Yes'
      })

      if (confirmAction.value === true) {
        state.flowSequence.exchanges.splice(payload.id, 1)
        if (state.flowSequence.exchanges.length < 1) {
          state.flowSequence.exchanges.push({
            intent: '',
            userSays: '',
            botResponses: [{
              response: '',
              results: 'N/A'
            }],
            results: {
              intent: 'N/A',
              response: 'N/A',
              summary: 'N/A'
            }
          })
        }
      }
    } else if (payload.prop === 'exchange' && payload.value === 'add') {
      state.flowSequence.exchanges.push({
        intent: '',
        userSays: '',
        botResponses: [{
          response: '',
          results: 'N/A'
        }],
        results: {
          intent: 'N/A',
          response: 'N/A',
          summary: 'N/A'
        }
      })
    } else {
      Vue.set(state.flowSequence.exchanges[payload.id], payload.prop, payload.value)
    }
  },
  async setFlowGroup(state, payload) {
    if (payload === 'Add Group') {
      const flowGroup = await this.$swal.fire({
        title: 'Enter Name of Group',
        input: 'text',
        showCancelButton: true,
        inputValidator: (value) => {
          if (value.trim() === '') {
            return 'Please Enter a Valid Name!'
          } else {
            state.flowGroup.options.push(value)
            state.flowGroups.push({
              included: false,
              name: value,
              sequences: [],
              results: {
                intent: 'N/A',
                response: 'N/A',
                summary: 'N/A'
              },
              uid: ''
            })
            state.flowGroup.options = state.flowGroup.options.sort().filter((option) => {
              return option !== 'Add Group'
            })
            state.flowGroup.options.push('Add Group')
            state.flowGroup.selected = state.flowGroups.find((group) => {
              return group.name === value
            })
          }
        }
      })

      if (flowGroup.value === undefined) {
        state.flowGroup.selected = Object.assign({}, {
          name: '',
          sequences: []
        })
      }
    } else {
      state.flowGroup.selected = state.flowGroups.find((group) => {
        return group.name === payload
      })
    }
  },
  async setBotResponse(state, payload) {
    if (payload.value === 'delete') {
      const confirmAction = await this.$swal.fire({
        title: 'Are You sure?',
        icon: 'warning',
        text: 'Are you sure you want to delete this Bot Response?',
        showCancelButton: true,
        confirmButtonText: 'Yes'
      })

      if (confirmAction.value === true) {
        state.flowSequence.exchanges[payload.id].botResponses.splice(payload.botResponseId, 1)
      }
    } else {
      Vue.set(state.flowSequence.exchanges[payload.id].botResponses[payload.botResponseId], 'response', payload.value)
    }
  },
  addBotResponse(state, payload) {
    state.flowSequence.exchanges[payload.id].botResponses.push({ response: '', results: 'N/A' })
  },
  sortFlowSequence(state, payload) {
    state.flowSequence.exchanges = payload
  },
  editFlowSequence(state, payload) {
    state.flowGroup.selected = state.flowGroups.find((group) => {
      return group.name === payload.group
    })

    const flowSequence = state.flowGroup.selected.sequences.find((sequence) => {
      return sequence.title.current === payload.title
    })

    Vue.set(state, 'flowSequence', flowSequence)
    window.scrollTo(0, 0)
  },
  duplicateFlowSequence(state, payload) {
    const duplicateCount = state.flowGroup.selected.sequences.filter((sequence) => {
      return sequence.title.current.includes(`${state.flowSequence.title.current} (Copy`)
    })
    const duplicateFlowSequence = {
      included: false,
      title: {
        current: `${state.flowSequence.title.current} (Copy) - ${duplicateCount.length + 1}`,
        previous: ''
      },
      description: state.flowSequence.description,
      exchanges: JSON.parse(JSON.stringify(state.flowSequence.exchanges)),
      results: {
        intent: 'N/A',
        response: 'N/A',
        summary: 'N/A'
      }
    }

    duplicateFlowSequence.exchanges.forEach((exchange) => {
      exchange.results = {
        intent: 'N/A',
        response: 'N/A',
        summary: 'N/A'
      }
      exchange.botResponses.forEach((response) => {
        response.results = {
          response: '',
          results: 'N/A'
        }
      })
    })

    Vue.set(state, 'flowSequence', duplicateFlowSequence)
  },
  setFlowExchangeTranscript(state, payload) {
    const botResponses = []

    payload.transcript.response.forEach((response) => {
      botResponses.push({
        response,
        results: 'N/A'
      })
    })
    Vue.set(state.flowSequence.exchanges[payload.id], 'intent', payload.transcript.intent)
    Vue.set(state.flowSequence.exchanges[payload.id], 'botResponses', botResponses)
  },
  branchFlowSequence(state, payload) {
    const branchCount = state.flowGroup.selected.sequences.filter((sequence) => {
      return sequence.title.current.includes(`${state.flowSequence.title.current} (Branch`)
    })
    const branchFlowSequence = {
      included: false,
      title: {
        current: `${state.flowSequence.title.current} (Branch) - ${branchCount.length + 1}`,
        previous: ''
      },
      description: state.flowSequence.description,
      exchanges: JSON.parse(JSON.stringify(state.flowSequence.exchanges)),
      results: {
        intent: 'N/A',
        response: 'N/A',
        summary: 'N/A'
      }
    }

    branchFlowSequence.exchanges.splice(payload.id + 1)
    branchFlowSequence.exchanges.forEach((exchange) => {
      exchange.results = {
        intent: 'N/A',
        response: 'N/A',
        summary: 'N/A'
      }
      exchange.botResponses.forEach((response) => {
        response.results = {
          response: '',
          results: 'N/A'
        }
      })
    })

    Vue.set(state, 'flowSequence', branchFlowSequence)
  },
  includeFlowGroup(state, payload) {
    const flowGroup = state.flowGroups.find((group) => {
      return group.name === payload.name
    })

    if (payload.propagate) {
      Vue.nextTick(() => {
        if (flowGroup.included) {
          flowGroup.sequences.forEach((sequence) => {
            sequence.included = true
          })
        } else {
          flowGroup.sequences.forEach((sequence) => {
            sequence.included = false
          })
        }
      })
    } else {
      flowGroup.included = true
    }
  },
  includeFlowSequence(state, payload) {
    const flowGroup = state.flowGroups.find((group) => {
      return group.name === payload.group
    })

    Vue.set(flowGroup.sequences[payload.id], 'included', payload.included)
  },
  async clearFlowSequence(state, payload) {
    const defaultFlow = {
      included: false,
      title: {
        current: '',
        previous: ''
      },
      description: '',
      exchanges: [{
        intent: '',
        userSays: '',
        botResponses: [{
          response: '',
          results: 'N/A'
        }],
        results: {
          intent: 'N/A',
          response: 'N/A',
          summary: 'N/A'
        }
      }],
      results: {
        intent: 'N/A',
        response: 'N/A',
        summary: 'N/A'
      }
    }
    const defaultFlowGroupSelected = {
      included: false,
      name: '',
      sequences: [],
      results: {
        intent: 'N/A',
        response: 'N/A',
        summary: 'N/A'
      }
    }

    if (payload.confirm) {
      const confirmAction = await this.$swal.fire({
        title: 'Are You sure?',
        icon: 'warning',
        text: 'Are you sure you want to Clear this Conversation?',
        showCancelButton: true,
        confirmButtonText: 'Yes'
      })

      if (confirmAction.value) {
        Vue.set(state, 'flowSequence', defaultFlow)
        Vue.set(state, 'flowSequenceShuffle', false)
        Vue.set(state.flowGroup, 'selected', defaultFlowGroupSelected)
        state.isFlowsequenceDirty = false
      }
    } else {
      Vue.set(state, 'flowSequence', defaultFlow)
      Vue.set(state, 'flowSequenceShuffle', false)
      Vue.set(state.flowGroup, 'selected', defaultFlowGroupSelected)
      state.isFlowsequenceDirty = false
    }
  },
  clearFlowGroup(state, payload) {
    const defaultFlowGroup = {
      selected: {
        included: false,
        name: '',
        sequences: [],
        results: {
          intent: 'N/A',
          response: 'N/A',
          summary: 'N/A'
        }
      },
      options: []
    }

    Vue.set(state, 'flowGroup', defaultFlowGroup)
  },
  clearAgent(state, payload) {
    const defaultAgent = {
      selected: {
        name: '',
        projectId: ''
      },
      names: [],
      options: [],
      context: {
        id: '',
        lifespan: 0,
        parameters: [['', '']]
      }
    }

    Vue.set(state, 'agent', defaultAgent)
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
