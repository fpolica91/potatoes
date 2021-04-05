<template>
  <v-app v-show="!loading" light>
    <v-navigation-drawer
      v-show="isAuth"
      v-model="drawer"
      :mini-variant="miniVariant"
      :clipped="clipped"
      :width="navigationWidth"
      :stateless="!isAuth"
      :permanent="!isMobile"
      fixed
      app
    >
      <v-list>
        <!-- BotQaQi -->
        <v-list-tile to="/botqaqi" router :exact="true">
          <v-list-tile-action :style="setAlignment">
            <v-icon>question_answer</v-icon>
            <span
              :style="setDisplay"
            >
              BotQaQi
            </span>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title v-text="`BotQaQi`" />
          </v-list-tile-content>
        </v-list-tile>

        <!-- Settings -->
        <v-list-tile to="/settings" router :exact="true">
          <v-list-tile-action :style="setAlignment">
            <v-icon>settings</v-icon>
            <span
              :style="setDisplay"
            >
              Settings
            </span>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title v-text="`Settings`" />
          </v-list-tile-content>
        </v-list-tile>

        <!-- Billing -->
        <v-list-tile v-if="false" to="/billing" router :exact="true">
          <v-list-tile-action :style="setAlignment">
            <v-icon>payment</v-icon>
            <span
              :style="setDisplay"
            >
              Billing
            </span>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title v-text="`Billing`" />
          </v-list-tile-content>
        </v-list-tile>

        <!-- Logout -->
        <v-list-tile v-show="isAuth" to="/logout" router :exact="false">
          <v-list-tile-action :style="setAlignment">
            <v-icon>exit_to_app</v-icon>
            <span
              :style="setDisplay"
            >
              Logout
            </span>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title v-text="`Logout`" />
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>

    <v-toolbar v-show="isAuth" :style="[toolbarFlushLeftMobile, toolbarFlushLeft]" :clipped-left="clipped" fixed app>
      <v-toolbar-side-icon v-show="!isMobile" @click="miniVariant = !miniVariant">
        <v-icon>{{ navigationMenu }}</v-icon>
      </v-toolbar-side-icon>

      <v-toolbar-side-icon v-show="isMobile" @click="drawer = !drawer">
        <v-icon>{{ navigationMenuMobile }}</v-icon>
      </v-toolbar-side-icon>

      <v-toolbar-title v-text="title" />
      <v-spacer />
      <nuxt-link to="/settings" style="text-decoration: none">
        <v-btn color="primary" flat icon>
          <v-icon size="28">
            support
          </v-icon>
        </v-btn>
      </nuxt-link>
    </v-toolbar>

    <v-content :style="contentFlush">
      <v-container>
        <nuxt />
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import Config from '~/botqaqi.config.js'
const { mapGetters } = createNamespacedHelpers('auth') // eslint-disable-line
export default {
  data() {
    return {
      loading: true,
      clipped: false,
      drawer: true,
      fixed: false,
      miniVariant: true,
      title: Config.site.env === 'Development' ? 'BotQaQi (Development)' : 'BotQaQi',
      groups: {
        admin: {
          miniVariant: `<i aria-hidden="true" class="v-icon material-icons theme--light">build</i><span class="tooltip_span tooltip_span--header" style="display: flex;">Admin</span>`,
          fullVariant: `<i aria-hidden="true" class="v-icon material-icons theme--light">build</i>`
        }
      },
      // admin: [
      //   {
      //     icon: 'update',
      //     title: 'Actions',
      //     to: '/actions'
      //   }
      // ],
      windowSize: ''
    }
  },
  computed: {
    ...mapGetters(['isAuth', 'practice']),
    isMobile() {
      return this.windowSize < 1024
    },
    navigationMenu() {
      if (!this.miniVariant) return 'menu_open'
      else return 'menu'
    },
    setDisplay() {
      return !this.miniVariant ? 'display:none' : 'display:flex'
    },

    setAlignment() {
      return !this.miniVariant ? 'align-items: flex-start !important' : 'align-items: center !important'
    },
    navigationMenuMobile() {
      if (this.drawer) return 'menu_open'
      else return 'menu'
    },
    navigationWidth() {
      if (!this.miniVariant) return '256px'
      else return 'auto'
    },
    titleDivider() {
      return this.practice === '' ? '' : '|'
    },
    toolbarFlushLeft() {
      return !this.miniVariant && !this.isMobile ? 'padding-left: 256px !important' : 'padding-left: 80px !important'
    },
    toolbarFlushLeftMobile() {
      return this.drawer && this.isMobile ? 'padding-left: 256px !important' : ''
    },
    contentFlush() {
      if (this.isAuth) return [this.contentFlushLeft, this.contentFlushLeftMobile]
      else return 'padding: 64px 0 0 0 !important'
    },
    contentFlushLeft() {
      return !this.miniVariant && !this.isMobile ? 'padding: 64px 0 0 256px !important' : 'padding: 64px 0 0 80px !important'
    },
    contentFlushLeftMobile() {
      return this.drawer && this.isMobile ? 'padding: 64px 0 0 256px !important' : 'padding: 64px 0 0 0 !important'
    }
  },
  watch: {
    isMobile() {
      if (this.isMobile) this.miniVariant = false
      else this.miniVariant = true
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.$nuxt.$loading.start({ init: true, save: false })
      setTimeout(() => {
        this.$nuxt.$loading.finish({ init: false, save: false })
        this.loading = false
      }, 2000)
    })
    this.windowSize = window.innerWidth
    window.addEventListener('resize', () => {
      this.windowSize = window.innerWidth
    })
    if (this.isMobile) this.miniVariant = false
  },
  methods: {
  }
}
</script>

<style>
.link-border--top {
  border-style: solid;
  border-width: 1px 0 0 0;
  border-color: rgba(0,0,0,.12);
}
.link-border--bottom {
  border-style: solid;
  border-width: 0 0 1px 0;
  border-color: rgba(0,0,0,.12);
}
.v-list__tile__action--stack {
  align-items: center !important;
  justify-content: center !important;
  font-size: 12px;
}
.v-navigation-drawer--mini-variant .v-list__group__header__prepend-icon {
  align-items: center !important;
  flex-direction: column !important;
  margin: 4px 0 8px 0;
}
span.tooltip_span {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top:  -8px;
  position: inherit;
  font-size: 12px;
  font-weight: 500;
}
.tooltip_span--header {
  position: relative !important;
  top: 8px;
}
.inner_span {
  font-size: 12px;
  align-self: center;
}

.v-list__group__items > div {
  padding-left: 6px !important;
  padding-right:0;
}

</style>
