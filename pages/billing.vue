<template>
  <v-layout column justify-center align-center>
    <v-card class="billing__card">
      <!-- Header -->
      <v-card-text>
        <v-card-title class="headline billing__card-title-headline">
          <v-icon class="billing__card-icon">
            payment
          </v-icon>Account Billing
        </v-card-title>
      </v-card-text>
      <v-divider class="heading_divider" />

      <!-- Practice -->
      <v-layout>
        <v-card-text class="billing__card-text">
          <v-card-title class="title billing__card-title">
            Subscriptions
          </v-card-title>
          <v-layout row wrap>
            <div v-for="(product, index ) in subscriptions" :key="index" class="productPanel">
              <v-flex sm12>
                <v-checkbox
                  :label="`${product.displayName}`"
                  :input-value="product.selected"
                  @change="setSubscriptionOptions({value: $event , prop: product.label})"
                />
              </v-flex>
            </div>
          </v-layout>
        </v-card-text>
      </v-layout>
      <v-divider class="heading_divider" />

      <!-- Information -->
      <v-card-text class="billing__card-text billing__card-information">
        <v-card-title class="title billing__card-title">
          Billing Information
        </v-card-title>
        <v-form>
          <v-container column>
            <v-layout row wrap>
              <v-flex xsm12 sm12 md4>
                <v-text-field
                  outline
                  label="Street Adress"
                  :value="address.street"
                  @input="setAddress({prop: 'street', value : $event})"
                />
              </v-flex>
              <v-flex xs12 sm12 md4>
                <v-text-field
                  :value="address.city"
                  outline
                  label="City"
                  @input="setAddress({prop: 'city', value : $event})"
                />
              </v-flex>

              <v-flex xs12 sm12 md4>
                <v-text-field
                  :value="address.zip"
                  outline
                  label="Zip Code"
                  @input="setAddress({prop: 'zip', value : $event})"
                />
              </v-flex>
            </v-layout>

            <v-layout row wrap>
              <v-flex xs12 sm12 md4>
                <v-text-field
                  :value="address.country"
                  outline
                  label="Country"
                  @input="setAddress({prop: 'country', value : $event})"
                />
              </v-flex>
              <v-flex xs12 sm12 md4>
                <v-text-field
                  outline
                  :value="customer.email"
                  label="Email"
                  @input="setCustomer({prop: 'email', value: $event})"
                />
              </v-flex>

              <v-flex xs12 sm12 md4>
                <v-text-field
                  outline
                  :value="customer.phone"
                  label="Phone Number"
                  @input="setCustomer({prop: 'phone', value: $event})"
                />
              </v-flex>
            </v-layout>
          </v-container>
        </v-form>
      </v-card-text>

      <!-- Payment -->
      <v-card-text class="billing__card-text">
        <v-layout>
          <v-card-title class="title billing__card-title">
            Payment Method
          </v-card-title>
        </v-layout>
        <v-layout row wrap>
          <v-flex xs12 sm12 md6 class="stripe_div">
            <div id="card-item" ref="card" />
          </v-flex>
          <v-flex sm12 xs12 md6 class="billing__card-buttons">
            <v-btn class="billing__card-button" color="primary" large @click="generateToken">
              <v-icon style="margin-right: 8px">
                update
              </v-icon>
              {{ customer.active ? 'Update' : 'Subscribe' }}
            </v-btn>

            <v-btn
              class="billing__card-button"
              color="primary"
              large
              :disabled="!customer.active"
              @click="cancelSubscription"
            >
              <v-icon style="margin-right: 8px">
                cancel
              </v-icon>Cancel
            </v-btn>
          </v-flex>
        </v-layout>
      </v-card-text>

      <v-divider />

      <!-- History -->
      <v-layout>
        <v-card-text class="billing__card-text">
          <v-card-title class="title title billing__card-title">
            Billing History
          </v-card-title>
        </v-card-text>
      </v-layout>

      <v-data-table :headers="headers" :items="items" hide-actions class="billing__table">
        <template v-slot:items="props">
          <td class="billing-item">
            {{ props.item.invoice_id }}
          </td>
          <td class="billing-item">
            {{ props.item.created | timestamp }}
          </td>
          <td class="billing-item">
            {{ props.item.price | currency }}
          </td>
          <td class="billing-item">
            {{ props.item.subscription }}
          </td>
          <td class="billing-item">
            {{ props.item.customer }}
          </td>
          <td :class="isDisabled" class="billing__table-actions">
            <!-- <a rel="stylesheet" :href="props.item.invoice_pdf"> -->
            <v-icon
              small
              class="mr-2"
              @click="handlePdfDownload(props.item.invoice_pdf)"
            >
              picture_as_pdf
            </v-icon>
            <!-- </a> -->
          </td>
        </template>
      </v-data-table>
    </v-card>
  </v-layout>
</template>
<script>
/* eslint-disable */
import { createNamespacedHelpers } from 'vuex';
import Config from '~/botqaqi.config.js';
import moment from 'moment';

const { mapState, mapActions, mapMutations } = createNamespacedHelpers(
  'billing'
);
const style = {
  base: {
    flex: 1,
    color: '#32325d',
    fontFamily: `'Roboto', Helvetica, sans-serif`,
    fontSmoothing: 'antialiased',
    fontSize: '16px',
    '::placeholder': {
      color: '#383838'
    }
  },
  invalid: {
    color: '#fa755a',
    iconColor: '#fa755a'
  }
};

export default {
  middleware: 'auth',
  filters: {
    timestamp(date) {
      return moment(date * 1000).format('MMM Do YYYY');
    },
    currency(num) {
      const price = num / 100;
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
      });
      return formatted.format(price);
    }
  },
  computed: {
    ...mapState([
      'address',
      'customer',
      'subscriptions',
      'headers',
      'items',
      'subscriptionOptions'
    ])
  },
  async mounted() {
    this.$nuxt.$loading.start({ init: false, save: true, wait: true });
    await this.$store.dispatch('billing/getResources');
    this.stripe = Stripe(Config.vendor.stripe.apiKey); // eslint-disable-line
    this.elements = this.stripe.elements();
    this.card = this.elements.create('card', { style: style });
    this.card.mount('#card-item');
    /* eslint-disable no-console */
  },
  methods: {
    ...mapActions([
      'handleSubmit',
      'getCustomerInformation',
      'getCustomerInvoiceData',
      'cancelSubscription',
      'handlePdfDownload'
    ]),
    ...mapMutations(['setCustomer', 'setAddress', 'setSubscriptionOptions']),

    async generateToken(e) {
      const cardElement = await this.elements.getElement('card');
      if (cardElement._empty === false) {
        e.preventDefault();
        const paymentMethod = await this.stripe.createPaymentMethod({
          type: 'card',
          card: this.card,
          billing_details: {
            email: this.customer.email,
            phone: this.customer.phone
          }
        });

        if (paymentMethod.error) {
          const errorMessage =
            paymentMethod.error.param === 'billing_details[phone]'
              ? 'Please enter a valid phone number'
              : paymentMethod.error.message;
          this.card.focus();
          return this.$swal.fire({
            title: 'Error',
            icon: 'error',
            text: errorMessage
          });
        }
        await this.handleSubmit({ paymentMethod });
        this.card.clear();
      }else {
        await this.handleSubmit()
        this.card.clear()
      }
    }
  }
};
</script>

<style>
.billing__card {
  width: 100%;
  margin-bottom: 24px;
}
.billing__card-title-headline {
  width: 100%;
  padding-bottom: 0;
  margin: -14px 0 0 -14px;
}
.billing__card-title {
  width: 100%;
  padding-top: 24px;
  padding-bottom: 0;
}
.billing__card-icon {
  margin-right: 8px;
}

.billing__card-text {
  padding-top: 0;
}

.billing__card-buttons {
  padding: 16px 0 8px 24px;
  width: 100%;
  display: flex !important;
  justify-content: flex-end !important;
  flex-flow: wrap;
}

.billing__card-button {
  width: 100%;
}

.billing__card-information {
  margin-bottom: -48px;
}

.billing__table-actions {
  display: flex;
  justify-content: center;
  align-items: center;
}

.billing__card-subtitle {
  font-size: 20px !important;
  padding: 8px 0;
}

.billing__table {
  border-bottom: 1px solid #c5c5c5;
  margin-top: 0;
}

.billing-item {
  cursor: pointer;
}

/* Stripe UI */
.stripe_div {
  padding: 15px 0px 0 16px;
}

.StripeElement {
  box-sizing: border-box;
  margin-right: 10px;
  height: 50px;

  padding: 15px 12px;

  border: 2px solid #706f6f;
  border-radius: 4px;
  background-color: white;

  box-shadow: 0 1px 3px 0 #e6ebf1;
  -webkit-transition: box-shadow 150ms ease;
  transition: box-shadow 150ms ease;
  transition: border-color 0.2s;
}

.StripeElement:hover {
  border-color: #000000;
}

.productPanel {
  margin-bottom: -10px !important;
  padding: 5px 0px 0px 16px;
  font-weight: 500;
}

.icon {
  margin-left: 3px;
  margin-right: 3px;
}

.payment_history {
  margin-top: 10px;
  margin-bottom: 10px;
  margin-left: 5px;
}

.billing {
  width: 256px;
}

@media only screen and (min-width: 480px) {
  .billing__card-buttons {
    padding: 14px 10px;
    width: 100%;
    display: flex !important;
    justify-content: flex-end !important;
    flex-flow: unset;
  }

  .billing__card-button {
    width: unset;
  }
}
</style>
