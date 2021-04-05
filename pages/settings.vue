<template>
  <v-layout column justify-center align-center>
    <!-- Company -->
    <v-card class="settings">
      <v-card-title class="title settings__title">
        <v-icon class="settings__icon">
          business
        </v-icon>
        Company
      </v-card-title>

      <!-- Note -->
      <v-subheader class="settings__subheader">
        <v-icon class="settings__icon">
          live_help
        </v-icon>
        Enter Company Name and Website URL (optional).
      </v-subheader>

      <!-- Content -->
      <v-card-text class="settings__content">
        <v-form>
          <v-container column>
            <v-layout row wrap>
              <v-flex xs12 sm6 md6>
                <v-text-field
                  :value="company.name"
                  label="Company Name"
                  persistent-hint
                  box
                  :disabled="!isAdmin"
                  @input="setCompany({
                    prop: 'name',
                    value: $event
                  })"
                />
              </v-flex>

              <v-flex xs12 sm6 md6>
                <v-text-field
                  :value="company.website"
                  label="Company Website"
                  persistent-hint
                  box
                  :disabled="!isAdmin"
                  @input="setCompany({
                    prop: 'website',
                    value: $event
                  })"
                />
              </v-flex>
            </v-layout>
          </v-container>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- Users -->
    <v-card class="settings">
      <v-card-title class="title settings__title">
        <v-icon class="settings__icon">
          people_alt
        </v-icon>
        Users
      </v-card-title>

      <!-- Note -->
      <v-subheader class="settings__subheader">
        <v-icon class="settings__icon">
          live_help
        </v-icon>
        Add / Remove Users and Control Access Level.
      </v-subheader>

      <!-- Content -->
      <v-card-text class="settings__content">
        <v-form>
          <v-container column>
            <v-layout v-for="(user, index) in company.users" :key="index" row wrap>
              <!--User Name -->
              <v-flex sm12 md4 class="settings__inline" style="padding: 8px">
                <v-text-field
                  :value="user.name"
                  label="Full Name"
                  box
                  outline
                  :disabled="!isAdmin"
                  @input="setUser({
                    id: index,
                    prop: 'name',
                    value: $event
                  })"
                />
              </v-flex>

              <!-- User Email -->
              <v-flex sm12 md4 style="padding: 8px">
                <v-text-field
                  :value="user.email"
                  label="Email Address"
                  box
                  outline
                  :disabled="!isAdmin"
                  @input="setUser({
                    id: index,
                    prop: 'email',
                    value: $event
                  })"
                />
              </v-flex>

              <!-- Access Level -->
              <v-flex sm12 md4 style="padding: 8px">
                <v-select
                  :value="user.ual"
                  :items="['Admin', 'QA Tester']"
                  label="Access Level"
                  box
                  outline
                  append-outer-icon="delete"
                  :disabled="!isAdmin"
                  @click:append-outer="deleteUser({ id: index })"
                  @change="setUser({
                    id: index,
                    prop: 'ual',
                    value: $event
                  })"
                />
              </v-flex>
            </v-layout>

            <v-flex v-if="isAdmin" xs12 sm12 md12 class="settings__users-actions">
              <v-btn
                color="primary"
                dark
                large
                @click="addUser"
              >
                <v-icon class="settings__icon">
                  add
                </v-icon>
                Add User
              </v-btn>
            </v-flex>
          </v-container>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- Save -->
    <v-layout row class="settings__save" :class="isDirty">
      <v-flex sm12 md12>
        <v-btn color="primary" dark large class="mb-2" @click="saveSettings">
          <v-icon style="margin-right: 8px">
            save_alt
          </v-icon>
          Save Settings
        </v-btn>
      </v-flex>
    </v-layout>
  </v-layout>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import Config from '~/botqaqi.config.js'
const { mapGetters, mapState, mapActions, mapMutations } = createNamespacedHelpers('settings') // eslint-disable-line

export default {
  middleware: 'auth',
  data: () => ({
    api: Config.api,
    windowSize: '',
    dirty: false
  }),
  computed: {
    ...mapState([
      'company'
    ]),
    ...mapGetters(['isAdmin', 'isDirty']),
    isMobile() {
      return this.windowSize < 1280
    }
  },
  mounted() {
    this.$store.subscribe((mutation) => {
      const mutationsList = [
        'settings/setCompany',
        'settings/setUser',
        'settings/addUser',
        'settings/deleteUser'
      ]
      if (mutationsList.includes(mutation.type)) {
        this.setDirty(true)
      }
    })

    this.$store.dispatch('settings/getSettings')

    // Set window size
    this.windowSize = window.innerWidth
    window.addEventListener('resize', () => {
      this.windowSize = window.innerWidth
    })
  },
  toRouteLeave(to, from, next) {
    this.$store.dispatch('settings/resetSettings')
    window.removeEventListener('resize', () => {
      this.windowSize = window.innerWidth
    })
    this.clear()
    next()
  },
  methods: {
    ...mapActions([
      'getSettngs',
      'saveSettings',
      'clearSettings'
    ]),
    ...mapMutations([
      'setDirty',
      'setSettings',
      'setCompany',
      'setUser',
      'addUser',
      'deleteUser'
    ])
  }
}
</script>

<style>
.v-form > .container > .layout > .flex {
    padding: 0px 8px !important;
}
.v-text-field__details {
  padding-left: 0 !important;
}
.settings {
  width:100%;
  margin-bottom: 24px;
}
.settings__inline {
  display: inline-flex;
  align-content: center;
}
.settings__inline-button {
  margin-left: 8px;
  font-size: 42px;
  /* color: red !important; */
  position: relative;
  top: -12px;
  cursor: pointer
}
.settings__spacer {
  padding: 0 !important;
  margin: 0 !important;
  height: 0.5px !important;
  width: 100%;
  background-color: rgba(0,0,0,0.12);
  margin-bottom: 24px !important;
}
.settings__title {
  padding: 20px 28px 0 28px;
  width: 100%;
}
.settings__title--margin-left {
  margin-left: -16px;
}
.settings__title--margin-bottom {
  margin-bottom: 16px;
}
.settings__subheader {
  min-height: 32px;
  position: relative;
  top: 0;
  padding: 0 26px;
}
.settings__icon {
  margin-right: 8px;
}
.settings__content {
  padding-top: 0;
}
.settings__save {
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
.settings__save--display {
  opacity: 1;
  bottom: 0;
}
.settings__submit {
  margin-top: 16px;
}
.settings__users-actions {
  display: flex;
  justify-content: flex-end;
  height: auto;
  width: 100%;
  background: white;
  position: relative;
  bottom: 0;
  z-index: 1;
}

@media only screen and (min-width: 800px) {

}
</style>
