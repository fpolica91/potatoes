<template>
  <v-layout column justify-center align-center class="botqaqi">
    <!-- BotQaQi : Tabs -->
    <v-tabs class="botqaqi__tabs" fixed-tabs>
      <v-tab
        v-for="(tab, index) in ['Config', 'BotQaQi']"
        :key="index"
        :disabled="(tab === 'BotQaQi' && isAgentDirty) ? true : false"
        @click="setTab(tab)"
      >
        {{ tab }}
      </v-tab>
    </v-tabs>

    <!-- Agent : Select -->
    <v-card v-show="isTabConfig" class="botqaqi__settings">
      <v-card-title class="title botqaqi__settings-title">
        <v-icon class="botqaqi__settings-title-icon">
          support_agent
        </v-icon> Agent
      </v-card-title>

      <!-- Note -->
      <v-subheader class="botqaqi__settings-subheader">
        <v-icon class="botqaqi__settings-title-icon">
          live_help
        </v-icon>
        Select DialogFlow Agent.
      </v-subheader>

      <!-- Content -->
      <v-card-text class="botqaqi__settings-content">
        <v-form>
          <v-container column>
            <v-layout row wrap>
              <!-- Agent Name -->
              <v-flex xs12 sm12 md6 style="padding: 8px 8px 0">
                <v-select
                  :value="agent.selected.name"
                  :items="agent.names"
                  label="Select Agent"
                  placeholder="Select Agent"
                  :menu-props="{ zIndex: '202' }"
                  outline
                  dense
                  @input="setAgentSelection"
                />
              </v-flex>

              <!-- Agent Project Id -->
              <v-flex xs12 sm12 md6 style="padding: 8px 8px 0">
                <v-text-field
                  :value="agent.selected.projectId"
                  label="Project Id"
                  placeholder=""
                  box
                  disabled
                />
              </v-flex>
            </v-layout>
          </v-container>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- Agent : Context -->
    <v-card v-show="isTabConfig" class="botqaqi__settings">
      <v-card-title class="title botqaqi__settings-title">
        <v-icon class="botqaqi__settings-title-icon">
          code
        </v-icon>
        Context
      </v-card-title>

      <!-- Note -->
      <v-subheader class="botqaqi__settings-subheader">
        <v-icon class="botqaqi__settings-title-icon">
          live_help
        </v-icon>
        Set Agent Context Id, Lifespan and Parameters.
      </v-subheader>

      <!-- Content -->
      <v-card-text class="botqaqi__settings-content">
        <v-form>
          <v-container column>
            <!-- Context Id / Lifespan -->
            <v-layout row wrap>
              <v-flex xs12 sm8 md10 style="padding: 8px 8px 0">
                <v-text-field
                  :value="agent.context.id"
                  label="Context Id"
                  placeholder=""
                  box
                  @input="setContext({
                    id: null,
                    prop: 'id',
                    value: $event
                  })"
                />
              </v-flex>

              <!-- Agent Project Id -->
              <v-flex xs12 sm4 md2 style="padding: 8px 8px 0">
                <v-text-field
                  :value="agent.context.lifespan"
                  label="Lifespan"
                  placeholder=""
                  box
                  type="number"
                  @input="setContext({
                    id: null,
                    prop: 'lifespan',
                    value: $event
                  })"
                />
              </v-flex>
            </v-layout>

            <!-- Parameters -->
            <v-layout v-for="(parameter, index) in agent.context.parameters" :key="index" row wrap>
              <!-- Key -->
              <v-flex sm12 md6>
                <v-text-field
                  :value="parameter[0]"
                  label="Key"
                  box
                  outline
                  @input="setContext({
                    id: index,
                    prop: 'parameters',
                    value: { id: 0, value: $event }
                  })"
                />
              </v-flex>

              <!-- Value -->
              <v-flex sm12 md6>
                <v-text-field
                  :value="parameter[1]"
                  label="Value"
                  box
                  outline
                  append-outer-icon="delete"
                  @click:append-outer="deleteParameter({ id: index })"
                  @input="setContext({
                    id: index,
                    prop: 'parameters',
                    value: { id: 1, value: $event }
                  })"
                />
              </v-flex>
            </v-layout>

            <v-flex sm12 md12 class="botqaqi__context-actions">
              <v-btn
                color="primary"
                dark
                large
                @click="addParameter"
              >
                <v-icon class="settings__card-icon">
                  add
                </v-icon>
                Add Parameter
              </v-btn>
            </v-flex>
          </v-container>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- Agent : Save -->
    <v-layout v-show="isTabConfig" row class="botqaqi__settings-save" :class="isAgentDirty">
      <v-flex sm12 md12>
        <v-btn color="primary" dark large class="mb-2" @click="saveAgentSettings">
          <v-icon style="margin-right: 8px">
            save_alt
          </v-icon>
          Save Config
        </v-btn>
      </v-flex>
    </v-layout>

    <!-- Conversation : Editor -->
    <v-card v-show="isTabBotQaQi" class="botqaqi__flow-sequence">
      <v-card-title class="title botqaqi__flow-sequence-title">
        <v-icon class="botqaqi__flow-sequence-title-icon">
          insert_comment
        </v-icon> Conversation Editor
      </v-card-title>

      <!-- Conversation -->
      <v-card-text class="botqaqi__flow-sequence-text">
        <v-form>
          <v-container column>
            <!-- Title -->
            <v-layout row wrap>
              <v-flex xs12 sm12 md8 style="padding: 8px 8px 0">
                <v-text-field
                  :value="flowSequence.title.current"
                  label="Conversation Title"
                  placeholder=""
                  box
                  @input="setFlowSequence({
                    prop: 'title',
                    value: $event
                  })"
                />
              </v-flex>

              <v-flex xs12 sm12 md4 style="padding: 8px 8px 0">
                <v-select
                  :value="flowGroup.selected.name"
                  :items="flowGroup.options"
                  label="Flow Group"
                  placeholder="Select Flow Group"
                  :menu-props="{ zIndex: '202' }"
                  outline
                  dense
                  @input="setFlowGroup"
                />
              </v-flex>

              <!-- Description -->
              <v-flex xs12 sm12 md12 style="padding: 0 8px">
                <v-textarea
                  label="Description"
                  :value="flowSequence.description"
                  placeholder=""
                  rows="2"
                  box
                  @input="setFlowSequence({
                    prop: 'description',
                    value: $event
                  })"
                />
              </v-flex>
            </v-layout>

            <!-- Exchanges (draggable)-->
            <draggable
              v-show="flowSequenceShuffle"
              v-model="exchanges"
              group="exchanges"
              class="botqaqi__flow-sequence-exchange"
              @start="drag=true"
              @end="drag=false"
            >
              <div
                v-for="(exchange, index) in exchanges"
                :key="index"
                class="botqaqi__flow-sequence-exchange-inputs-draggable"
              >
                <v-flex xs12 sm12 md5 class="botqaqi__flow-sequence-exchange-input">
                  <v-text-field
                    :value="flowSequence.exchanges[index].userSays"
                    hint=""
                    label="User Says"
                    persistent-hint
                    outline
                    disabled
                  />
                </v-flex>

                <v-flex xs12 sm12 md1 class="botqaqi__flow-sequence-exchange-input-icon-container">
                  <v-icon class="botqaqi__flow-sequence-exchange-input-icon">
                    sync_alt
                  </v-icon>
                </v-flex>

                <v-flex xs12 sm12 md5 class="botqaqi__flow-sequence-exchange-input">
                  <v-text-field
                    :value="flowSequence.exchanges[index].botResponse"
                    hint=""
                    label="Bot Response"
                    persistent-hint
                    outline
                    :append-icon="'add'"
                    disabled
                  />
                </v-flex>

                <v-flex xs12 sm12 md1 class="botqaqi__flow-sequence-exchange-input-icon-container-drag-handle">
                  <v-icon
                    class="botqaqi__flow-sequence-exchange-input-icon-drag-handle"
                  >
                    drag_handle
                  </v-icon>
                </v-flex>
              </div>
            </draggable>

            <!-- Exchanges (non-draggable)-->
            <div v-show="!flowSequenceShuffle" class="botqaqi__flow-sequence-exchange">
              <div
                v-for="(exchange, index) in exchanges"
                :key="index"
                class="botqaqi__flow-sequence-exchange-inputs"
              >
                <v-flex xs12 sm12 md6 class="botqaqi__flow-sequence-exchange-intent">
                  <v-combobox
                    class="botqaqi__flow-sequence-exchange-intent-input"
                    :value="flowSequence.exchanges[index].intent"
                    :items="flowSequenceIntents"
                    label="Select Intent"
                    chips
                    clearable
                    outline
                    single-line
                    @input="setflowSequenceIntent({
                      id: index,
                      value: $event
                    })"
                  >
                    <template v-slot:selection="data">
                      <v-chip
                        :selected="data.selected"
                      >
                        <strong>
                          {{ data.item }}
                        </strong>
                      </v-chip>
                    </template>
                  </v-combobox>
                </v-flex>

                <v-flex xs12 sm12 md6 class="botqaqi__flow-sequence-exchange-results">
                  <div class="botqaqi__flow-sequence-exchange-transcript">
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on }">
                        <v-icon
                          class="botqaqi__flow-sequence-exchange-transcript-icon"
                          @click="getFlowExchangeTranscript({
                            id: index,
                            transcript: exchange.transcript
                          })"
                          v-on="on"
                        >
                          question_answer
                        </v-icon>
                      </template>
                      <span>Transcript</span>
                    </v-tooltip>
                  </div>

                  <div class="botqaqi__flow-sequence-exchange-result">
                    <span class="botqaqi__flow-sequence-exchange-result-text">
                      Intent
                    </span>
                    <v-icon
                      class="botqaqi__flow-sequence-exchange-result-icon"
                      :class="setResultColor(exchange.results.intent)"
                    >
                      {{ setResultIcon(exchange.results.intent) }}
                    </v-icon>
                  </div>

                  <div class="botqaqi__flow-sequence-exchange-result">
                    <span class="botqaqi__flow-sequence-exchange-result-text">
                      Response
                    </span>
                    <v-icon
                      class="botqaqi__flow-sequence-exchange-result-icon"
                      :class="setResultColor(exchange.results.response)"
                    >
                      {{ setResultIcon(exchange.results.response) }}
                    </v-icon>
                  </div>
                </v-flex>

                <v-flex xs12 sm12 md5 class="botqaqi__flow-sequence-exchange-input">
                  <v-text-field
                    :value="flowSequence.exchanges[index].userSays"
                    hint=""
                    label="User Says"
                    persistent-hint
                    outline
                    @input="setFlowExchange({ prop: 'userSays', id: index, value: $event })"
                  />
                </v-flex>

                <v-flex xs12 sm12 md1 class="botqaqi__flow-sequence-exchange-input-icon-container">
                  <v-icon class="botqaqi__flow-sequence-exchange-input-icon">
                    sync_alt
                  </v-icon>
                </v-flex>

                <v-flex xs12 sm12 md5 class="botqaqi__flow-sequence-exchange-input">
                  <v-text-field
                    :value="exchange.botResponses[0].response"
                    hint=""
                    label="Bot Response"
                    persistent-hint
                    outline
                    append-icon="add"
                    @click:append="addBotResponse({ id: index, value: $event })"
                    @input="setBotResponse({ id: index, botResponseId: 0, value: $event })"
                  />
                </v-flex>

                <v-flex xs12 sm12 md1 class="botqaqi__flow-sequence-exchange-input-icon-container">
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                      <v-icon
                        class="botqaqi__flow-sequence-exchange-input-icon"
                        :class="setResultColor(exchange.botResponses[0].results)"
                        v-on="on"
                      >
                        {{ setResultIcon(exchange.botResponses[0].results) }}
                      </v-icon>
                    </template>
                    <span>Test Results</span>
                  </v-tooltip>
                </v-flex>

                <v-flex xs12 sm12 md1 class="botqaqi__flow-sequence-exchange-input-icon-container">
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                      <v-icon
                        class="botqaqi__flow-sequence-exchange-input-icon"
                        @click="branchFlowSequence({ id: index })"
                        v-on="on"
                      >
                        transit_enterexit
                      </v-icon>
                    </template>
                    <span>Branch</span>
                  </v-tooltip>
                </v-flex>

                <v-flex xs12 sm12 md1 class="botqaqi__flow-sequence-exchange-input-icon-container">
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                      <v-icon
                        class="botqaqi__flow-sequence-exchange-input-icon"
                        @click="setFlowExchange({
                          id: index,
                          prop: 'exchange',
                          value: 'delete'
                        })"
                        v-on="on"
                      >
                        delete
                      </v-icon>
                    </template>
                    <span>Delete</span>
                  </v-tooltip>
                </v-flex>

                <div
                  v-for="(botResponse, botResponseIndex) in flowSequence.exchanges[index].botResponses"
                  :key="botResponseIndex"
                  class="botqaqi__flow-sequence-exchange-sub-inputs"
                >
                  <v-flex v-if="botResponseIndex !== 0" xs12 sm12 md10 class="botqaqi__flow-sequence-exchange-input">
                    <v-text-field
                      :value="flowSequence.exchanges[index].botResponses[botResponseIndex].response"
                      hint="Add Suggestion Chipsor Additional Bot Responses"
                      label="Bot Response"
                      persistent-hint
                      outline
                      :append-icon="''"
                      @input="setBotResponse({ id: index, botResponseId: botResponseIndex, value: $event })"
                    />
                  </v-flex>

                  <v-flex v-if="botResponseIndex !== 0" xs12 sm12 md1 class="botqaqi__flow-sequence-exchange-input-icon-container">
                    <v-icon
                      class="botqaqi__flow-sequence-exchange-input-icon"
                      :class="setResultColor(botResponse.results)"
                    >
                      {{ setResultIcon(botResponse.results) }}
                    </v-icon>
                  </v-flex>

                  <v-flex v-if="botResponseIndex !== 0" xs12 sm12 md1 class="botqaqi__flow-sequence-exchange-input-icon-container">
                    <v-icon
                      class="botqaqi__flow-sequence-exchange-input-icon"
                      @click="setBotResponse({ id: index, botResponseId: botResponseIndex, value: 'delete' })"
                    >
                      delete
                    </v-icon>
                  </v-flex>
                </div>
              </div>
            </div>
          </v-container>
        </v-form>
      </v-card-text>

      <!-- Controls-->
      <v-card-actions class="botqaqi__flow-sequence-exchange-controls">
        <!-- Left -->
        <v-layout column>
          <v-flex xs12 sm12 md12 class="botqaqi__flow-sequence-exchange-controls-left">
            <v-btn
              v-show="!flowSequenceShuffle"
              color="primary"
              dark
              @click="setFlowExchange({
                id: index,
                prop: 'exchange',
                value: 'add'
              })"
            >
              <v-icon style="margin-right: 8px;">
                add
              </v-icon>
              Add Exchange
            </v-btn>

            <v-btn color="primary" dark @click="setFlowSequenceShuffle">
              <v-icon style="margin-right: 8px">
                {{ flowSequenceShuffle ? 'create' : 'import_export' }}
              </v-icon>
              {{ flowSequenceShuffle ? 'Edit' : 'Reorder' }}
            </v-btn>
          </v-flex>
        </v-layout>

        <!-- Right -->
        <v-layout column>
          <v-flex xs12 sm12 md12 class="botqaqi__flow-sequence-exchange-controls-right">
            <v-btn color="primary" dark @click="duplicateFlowSequence">
              <v-icon style="margin-right: 8px">
                file_copy
              </v-icon>
              Duplicate
            </v-btn>

            <v-btn color="primary" dark @click="clearFlowSequence({ confirm: true })">
              <v-icon style="margin-right: 8px">
                delete_sweep
              </v-icon>
              Clear
            </v-btn>

            <v-btn color="primary" dark @click="deleteFlowSequence">
              <v-icon style="margin-right: 8px">
                delete
              </v-icon>
              Delete
            </v-btn>
          </v-flex>
        </v-layout>
      </v-card-actions>
    </v-card>

    <!-- Conversation : Groups -->
    <v-card
      v-show="isTabBotQaQi"
      :style="disableGroups"
      class="botqaqi__flow-groups-container"
    >
      <div
        class="botqaqi__flow-groups-toolbar"
      >
        <v-card-title class="title botqaqi__flow-groups-title">
          <v-icon class="botqaqi__flow-groups-title-icon">
            question_answer
          </v-icon> Conversation Groups
        </v-card-title>

        <!-- Controls-->
        <v-flex xs12 sm12 md12 class="botqaqi__flow-groups-controls">
          <v-switch
            :value="showAllFlowGroups"
            class="botqaqi__flow-groups-filter"
            color="primary"
            label="View All"
            @change="filterFlowGroups"
          />

          <v-btn color="primary" dark @click="testFlowSequences">
            <v-icon style="margin-right: 8px">
              playlist_add_check
            </v-icon>
            Run Test
          </v-btn>

          <v-btn color="primary" dark @click="refeshFlowGroups">
            <v-icon style="margin-right: 8px">
              update
            </v-icon>
            Refresh
          </v-btn>
        </v-flex>
      </div>

      <v-data-table
        :headers="headers"
        :items="flowGroups"
        item-key="name"
        :loading="loading"
        :must-sort="false"
        hide-actions
        :pagination.sync="pagination"
        class="botqaqi__flow-groups"
      >
        <v-progress-linear v-slot:progress color="blue" indeterminate />
        <template v-slot:items="props">
          <td
            :class="isDisabled"
            class="botqaqi__flow-groups-item"
          >
            <v-checkbox
              v-model="props.item.included"
              class="botqaqi__flow-groups-item-checkbox"
              @change="includeFlowGroup({
                name: props.item.name,
                propagate: true
              })"
            />
          </td>
          <td
            :class="isDisabled"
            class="botqaqi__flow-groups-item"
          >
            <v-list>
              <v-list-group prepend-icon="keyboard_arrow_down" append-icon="" no-action>
                <template v-slot:activator>
                  <v-list-tile>
                    <v-list-tile-content class="botqaqi__flow-groups-tile-title">
                      <v-list-tile-title>
                        {{ props.item.name }}
                      </v-list-tile-title>
                    </v-list-tile-content>
                  </v-list-tile>
                </template>

                <v-list-tile
                  v-for="(sequence, index) in props.item.sequences"
                  :key="index"
                >
                  <v-list-tile-action class="botqaqi__flow-groups-tile-action">
                    <v-checkbox
                      v-model="sequence.included"
                      @change="includeFlowGroup({
                        name: props.item.name,
                        propagate: false
                      })"
                    />
                  </v-list-tile-action>

                  <v-list-tile-content class="botqaqi__flow-groups-tile-content">
                    <v-list-tile-title
                      class="botqaqi__flow-groups-tile-subtitle"
                      @click="editFlowSequence({
                        group: props.item.name,
                        title: sequence.title.current
                      })"
                    >
                      {{ sequence.title.current }}
                    </v-list-tile-title>
                  </v-list-tile-content>

                  <v-list-tile-action class="botqaqi__flow-groups-tile-results">
                    Intent
                    <v-icon :class="setResultColor(sequence.results.intent)">
                      {{ setResultIcon(sequence.results.intent) }}
                    </v-icon>
                  </v-list-tile-action>

                  <v-list-tile-action class="botqaqi__flow-groups-tile-results">
                    Response
                    <v-icon :class="setResultColor(sequence.results.response)">
                      {{ setResultIcon(sequence.results.response) }}
                    </v-icon>
                  </v-list-tile-action>
                </v-list-tile>
              </v-list-group>
            </v-list>
          </td>
          <td
            :class="isDisabled"
            class="botqaqi__flow-groups-item-results"
          >
            <v-icon :class="setResultColor(props.item.results.intent)">
              {{ setResultIcon(props.item.results.intent) }}
            </v-icon>
          </td>
          <td
            :class="isDisabled"
            class="botqaqi__flow-groups-item-results"
          >
            <v-icon :class="setResultColor(props.item.results.response)">
              {{ setResultIcon(props.item.results.response) }}
            </v-icon>
          </td>
          <!-- <td
            :class="isDisabled"
            class="botqaqi__flow-groups-item-results"
          >
            <v-icon :class="setResultColor(props.item.results.summary)">
              {{ setResultIcon(props.item.results.summary) }}
            </v-icon>
          </td> -->
          <td :class="isDisabled" class="botqaqi__flow-groups-item-actions layout px-0">
            <v-icon small @click="deleteFlowGroup({ name: props.item.name })">
              delete
            </v-icon>
          </td>
        </template>

        <template v-slot:no-data>
          No Results...
        </template>
      </v-data-table>
    </v-card>

    <!-- Conversation : Save -->
    <v-layout v-show="isTabBotQaQi" row class="botqaqi__flow-sequence-save" :class="isFlowsequenceDirty">
      <v-flex sm12 md12>
        <v-btn color="primary" dark large class="mb-2" @click="saveFlowSequence">
          <v-icon style="margin-right: 8px">
            save_alt
          </v-icon>
          Save
        </v-btn>
      </v-flex>
    </v-layout>
  </v-layout>
</template>

<script>
import draggable from 'vuedraggable'
import { createNamespacedHelpers } from 'vuex'
const { mapState, mapGetters, mapActions, mapMutations } = createNamespacedHelpers('botqaqi')
/* eslint-disable no-console */
export default {
  middleware: 'auth',
  components: {
    draggable
  },
  data: () => ({
    pagination: {
      rowsPerPage: -1
    },
    windowSize: '',
    disable: '',
    pending: false
  }),
  computed: {
    ...mapState([
      'headers',
      'agent',
      'parameters',
      'flowSequence',
      'flowSequenceIntents',
      'flowSequenceShuffle',
      'flowGroup',
      'flowGroups',
      'showAllFlowGroups'
    ]),
    ...mapGetters([
      'isTabConfig',
      'isTabBotQaQi',
      'isAgentDirty',
      'isFlowsequenceDirty'
    ]),
    exchanges: {
      get() {
        return this.flowSequence.exchanges
      },
      set(value) {
        this.sortFlowSequence(value)
      }
    },
    isMobile() {
      return this.windowSize < 1280
    },
    disabled() {
      return this.flowSequence.title.current.trim() === '' ? 'disabled' : ''
    },
    disableGroups() {
      if (this.isFlowsequenceDirty) {
        return {
          opacity: 0.5,
          pointerEvents: 'none'
        }
      } else {
        return {
          opacity: 1,
          pointerEvents: 'initial'
        }
      }
    }
  },
  mounted() {
    // Check if Company Exists
    if (this.$store.state.auth.user.cuid === '' || this.$store.state.settings.company.cuid === '') {
      this.$router.push('settings')
      this.$swal.fire({
        title: 'Warning',
        icon: 'warning',
        text: `Please Register Company Name!`
      })
      return
    }

    // Override Tab container class
    document.getElementsByClassName('v-tabs__container')[0].style = "height: 32px !important; background-color: #fafafa;"

    // Watch Agent state
    this.$store.subscribe((mutation) => {
      const mutationsList = [
        'botqaqi/setContext',
        'botqaqi/addParameter',
        'botqaqi/deleteParameter',
        'botqaqi/setAgentSelection'
      ]
      if (mutationsList.includes(mutation.type)) {
        this.setAgentDirty(true)
      }
    })

    // Watch BotQaQi state
    this.$store.subscribe((mutation, state) => {
      const mutationsList = [
        'botqaqi/setFlowExchange',
        'botqaqi/setBotResponse',
        'botqaqi/setflowSequenceIntent',
        'botqaqi/addBotResponse',
        'botqaqi/setFlowSequence',
        'botqaqi/setFlowExchangeTranscript'
      ]
      if (mutationsList.includes(mutation.type) &&
       this.agent.selected.name !== '') {
        this.setFlowsequenceDirty(true)
      }
    })

    // Hydrate BotQaQi state
    this.$store.commit('botqaqi/setTab', 'Config')
    this.$store.dispatch('botqaqi/resetFlowSequence')
    this.$store.dispatch('botqaqi/getAgents')

    // Set window size
    this.windowSize = window.innerWidth
    window.addEventListener('resize', () => {
      this.windowSize = window.innerWidth
    })
  },
  toRouteLeave(to, from, next) {
    this.$store.dispatch('botqaqi/resetFlowSequence')
    window.removeEventListener('resize', () => {
      this.windowSize = window.innerWidth
    })
    this.clear()
    next()
  },
  methods: {
    setResultColor(results) {
      switch (results) {
        case 'Failed':
          return 'botqaqi__icon-failed'
        case 'Success':
          return 'botqaqi__icon-success'
        default:
          return 'botqaqi__icon-default'
      }
    },
    setResultIcon(results) {
      switch (results) {
        case 'Failed':
          return 'error'
        case 'Success':
          return 'check_circle'
        default:
          return 'radio_button_unchecked'
      }
    },
    ...mapActions([
      'setTab',
      'saveAgentSettings',
      'getFlowGroups',
      'testFlowSequences',
      'saveFlowSequence',
      'duplicateFlowSequence',
      'branchFlowSequence',
      'getFlowExchangeTranscript',
      'saveFlowSettings',
      'deleteFlowGroup',
      'deleteFlowSequence',
      'resetFlowSequence',
      'refeshFlowGroups',
      'filterFlowGroups'
    ]),
    ...mapMutations([
      'setAgentDirty',
      'setFlowsequenceDirty',
      'setContext',
      'setAgentSelection',
      'addParameter',
      'deleteParameter',
      'setFlowSequence',
      'setflowSequenceIntent',
      'setFlowSequenceShuffle',
      'setFlowExchange',
      'setFlowGroup',
      'setBotResponse',
      'addBotResponse',
      'removeIntent',
      'sortFlowSequence',
      'editFlowGroup',
      'editFlowSequence',
      'includeFlowGroup',
      'includeFlowSequence',
      'clearFlowSequence'
    ])
  }
}
</script>

<style scoped>
/* - - Global - - */
.botqaqi {
  position: relative;
  padding-bottom: 56px;
}
.botqaqi__tabs {
  position: absolute;
  left: 0;
  top: -8px;
}

/* - - Settings - - */
.botqaqi__settings {
  width:100%;
  margin-top: 24px;
}
.botqaqi__settings-content {
  padding-top: 0;
}
.botqaqi__settings-title {
  padding: 20px 28px 0 28px;
  width: 100%;
}
.botqaqi__settings-title-icon {
  margin-right: 8px;
}
.botqaqi__settings-subheader {
  padding: 0 26px;
}
.botqaqi__settings-save {
  display: flex;
  justify-content: center;
  align-content: center;
  background-color: #ffffffb5;
  height: fit-content;
  width: fit-content;
  padding: 4px;
  opacity: 0;
  transition: all 1s;
  position: fixed;
  bottom: -66px;
  border-radius: 4px;
  box-shadow: 0px 3px 1px -2px rgba(0,0,0,0.2),
  0px 2px 2px 0px rgba(0,0,0,0.14),
  0px 1px 5px 0px rgba(0,0,0,0.12);
  z-index: 1;
}
.botqaqi__settings-save--display {
  opacity: 1;
  bottom: 0;
}

/* - - Editor : Overrides - - */
.disabled {
  pointer-events: none;
  user-select: none;
  opacity: 0.5;
}
div.botqaqi__flow-sequence-exchange > div:nth-child(2n+0) {
  background: #00000008 !important;
  border-radius: 4px;
}
.v-input input {
  color: black !important;
}
.v-text-field > .v-input__control > .v-input__slot > .v-text-field__slot{
  background: white !important;
}
.v-text-field__details {
  padding-left: 0 !important;
}
.v-text-field.v-text-field--solo .v-input__control {
  height: 32px !important;
}
.v-text-field.v-text-field--solo:not(.v-text-field--solo-flat) > .v-input__control > .v-input__slot {
  box-shadow: none !important;
}
.v-select .v-chip {
  flex: 0 1 auto;
  font-weight: bold;
}

/* - - Editor - - */
.botqaqi__flow-sequence {
  width:100%;
  margin-top: 24px;
}
.botqaqi__flow-sequence-text {
  padding-top: 0;
}
.botqaqi__flow-sequence-title {
  padding: 20px 28px 0 28px;
  width: 100%;
}
.botqaqi__flow-sequence-title-icon {
  margin-right: 8px;
}
.botqaqi__flow-sequence-subheader {
  padding: 0 26px;
}
.botqaqi__flow-sequence-exchange-controls {
  padding: 0 28px 16px 28px;
  margin-top: -16px
}
.botqaqi__flow-sequence-exchange-controls-left {
  display: flex;
  justify-content: flex-start;
}
.botqaqi__flow-sequence-exchange-controls-right {
  display: flex;
  justify-content: flex-end;
}
.botqaqi__flow-sequence-exchange {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;
}
.botqaqi__flow-sequence-exchange-results {
  display: flex;
  justify-content: flex-end;
  height: 84px;
  position: relative;
}
.botqaqi__flow-sequence-exchange-result {
  display: flex;
  justify-content: center;
  align-content: center;
  height: 56px;
  width: 172px;
  border: 2px dashed #757575;
  border-radius: 4px;
  margin-left: 16px;
}
.botqaqi__flow-sequence-exchange-result-text {
  font-weight: bold;
  height: 24px;
  margin: 6px 8px 2px 2px;
  align-self: center;
}
.botqaqi__flow-sequence-exchange-result-icon {
  font-size: 24px;
  height: 24px;
  align-self: center;
}
.botqaqi__flow-sequence-exchange-transcript {
  display: flex;
  justify-content: center;
  align-content: center;
  height: 56px;
  width: 56px;
}
.botqaqi__flow-sequence-exchange-transcript-text {
  font-weight: bold;
  height: 24px;
  margin: 6px 8px 2px 2px;
  align-self: center;
}
.botqaqi__flow-sequence-exchange-transcript-icon {
  cursor: pointer;
  user-select: none;
  font-size: 24px;
  height: 24px;
  align-self: center;
}
.botqaqi__flow-sequence-exchange-intent {
  display: flex;
  justify-content: flex-end;
  height: fit-content;
  position: relative;
  padding: 0 50px 0 16px;
}
.botqaqi__flow-sequence-exchange-intent-input {
  max-width: 100%;
  padding: 0 8px;
  z-index: 1;
}
.botqaqi__flow-sequence-exchange-inputs {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  flex-direction: row;
  width: 100%;
  padding: 16px 14px 8px 14px;
}
.botqaqi__flow-sequence-exchange-sub-inputs {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  flex-direction: row;
  width: 100%;
}
.botqaqi__flow-sequence-exchange-inputs-draggable {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  flex-direction: row;
  width: 100%;
  cursor: pointer;
}
.botqaqi__flow-sequence-exchange-inputs-draggable:hover {
  background-color: #eeeeee;
  border: 2px solid #eeeeee;
  border-radius: 2px;
  opacity: 1;
}
.botqaqi__flow-sequence-exchange-input {
  padding: 8px;
}
.botqaqi__flow-sequence-exchange-input-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 24px;
  padding: 0;
  position: relative;
  top: -14px;
}
.botqaqi__flow-sequence-exchange-input-icon {
  cursor: pointer;
  font-size: 24px;
}
.botqaqi__flow-sequence-exchange-input-icon-container-drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 72px;
  padding: 0;
  position: relative;
  top: -14px;
}
.botqaqi__flow-sequence-exchange-input-icon-drag-handle {
  cursor: pointer;
  font-size: 32px;
}
.botqaqi__flow-sequence-exchange-actions {
  display: flex;
  justify-content: flex-start;
  height: auto;
  width: 100%;
  background: white;
  position: relative;
  bottom: 0;
  z-index: 1;
}
.botqaqi__context-actions {
  display: flex;
  justify-content: flex-end;
  height: auto;
  width: 100%;
  background: white;
  position: relative;
  bottom: 0;
  z-index: 1;
}
.botqaqi__flow-sequence-save{
  display: flex;
  justify-content: center;
  align-content: center;
  background-color: #ffffffb5;
  height: fit-content;
  width: fit-content;
  padding: 4px;
  opacity: 0;
  transition: all 1s;
  position: fixed;
  bottom: -66px;
  border-radius: 4px;
  box-shadow: 0px 3px 1px -2px rgba(0,0,0,0.2),
  0px 2px 2px 0px rgba(0,0,0,0.14),
  0px 1px 5px 0px rgba(0,0,0,0.12);
  z-index: 1;
}
.botqaqi__flow-sequence-save--display {
  opacity: 1;
  bottom: 0;
}

/* - - Groups : Overrides - - */
.v-list {
 padding: 0;
}
.v-list__tile__title {
  font-weight: 400;
  font-size: 13px;
  width: 100%;
}
.v-list__tile__action {
  min-width: 32px;
}
.v-list__group:before, .v-list__group:after {
  width: unset;
}
.v-list__group__items > div {
    display: block;
    height: 47px;
    padding-left: 0 !important;
    border-width: 0.5px 0 0 0;
    border-style: dashed;
    border-color: #bdbdbd;
}
.v-list__tile__title, .botqaqi__flow-groups-tile-subtitle {
  white-space: normal !important;
  overflow: visible;
  height: fit-content;
  padding: 5px 0px 5px 0px;
}
.v-input__slot {
  background-color: white !important;
}
.v-select > .v-input__control > .v-input__slot {
  background: transparent !important;
}
.v-list__group__header__append-icon i .v-icon  {
  display: none !important;
  visibility: hidden !important;
}

/* - - Groups - - */
.botqaqi__icon-success {
  color: green;
}
.botqaqi__icon-failed {
  color: red;
}
.botqaqi__icon-default {
  color: rgba(0,0,0,0.54);
}
.botqaqi__flow-groups-container {
  max-height: unset;
  width: 100%;
  overflow-y: unset;
  margin-top: 24px;
}
.botqaqi__flow-groups {
  border-bottom: 1px solid #c5c5c5;
  margin-top: 24px;
}
.botqaqi__flow-groups-toolbar {
  padding: 8px 0;
}
.botqaqi__flow-groups-item {
  position: relative;
  cursor: pointer;
}
.botqaqi__flow-groups-item-results {
  text-align: center;
}
.botqaqi__flow-groups-item-actions {
  padding-left: 36px !important;
}
.botqaqi__flow-groups-item-checkbox {
  position: absolute;
  left: 32px;
  top: 12px;
}
.botqaqi__flow-groups-tile .v-list__group__items--no-action .v-list__tile {
  padding-left: 0;
}
.botqaqi__flow-groups-tile-title {
  position: relative;
  left: -16px;
}
.botqaqi__flow-groups-tile-results {
  margin-left: 16px;
}
.botqaqi__flow-groups-tile-subtitle {
  max-height: 56px;
  max-width: 100%;
}
.botqaqi__flow-groups-tile-content {
  position: relative;
  left: -40px;
}
.botqaqi__flow-groups-tile-action {
  display: flex;
  align-items: flex-end;
  width: 0;
  position: absolute;
  left: 0;
}
.botqaqi__flow-groups-toolbar {
  display: flex;
  padding: 0 0 0 16px;
  width: 100%;
}
.botqaqi__flow-groups-title {
  padding: 0;
  width: 100%;
}
.botqaqi__flow-groups-title-icon {
  margin-right: 8px;
}
.botqaqi__flow-groups-controls {
  display: flex;
  justify-content: flex-end;
  padding: 8px 16px;
}
.botqaqi__flow-groups-filter {
  position: relative;
  margin: 0 16px;
  padding: 0;
  width: 104px;
  top: 14px;
}

@media only screen and (min-width: 960px) {
  .flex.md5 {
    flex-basis: 43.666667%;
    flex-grow: 0;
    max-width: 43.666667%;
  }
}
@media only screen and (min-width: 1024px) {
  .botqaqi__flow-groups-container {
    width: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    margin-top: 24px;
  }
  .botqaqi__flow-sequence-exchange-intent-input {
    max-width: 100%;
    padding: 0;
    z-index: 1;
  }
}
@media only screen and (min-width: 1264px) {
  .flex.md5 {
    flex-basis: 45%;
    flex-grow: 0;
    max-width: 45%;
  }
}
</style>
