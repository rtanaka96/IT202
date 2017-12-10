/*
Copyright 2016 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import sendToServer from './merchant-server.js';

const SHIPPING_OPTIONS = {
  us: [
    {
      id: 'standard',
      label: 'Standard Shipping',
      price: 0
    },
    {
      id: 'express',
      label: 'Express Shipping',
      price: 10
    }
  ],
  international: [
    {
      id: 'international',
      label: 'International Shipping',
      price: 15
    }
  ]
};

const PAYMENT_METHODS = [
];

export default class PaymentAPIWrapper {

  checkout(cart) {
    let request = this.buildPaymentRequest(cart);
    let response;
    return request.show()
      .then(r => {
        response = r;
        let data = r.toJSON();
        console.log(data);
        return data;
      })
      .then(data => {
        return sendToServer(data);
      })
      .then(() => {
        response.complete('success');
      })
      .catch(e => {
        response.complete('fail');
        console.error(e);
      });
  }

  buildPaymentRequest(cart) {
    const supportedInstruments = [{
      supportedMethods: ['https://android.com/pay'],
      data: {
        environment: 'TEST',
        allowedCardNetworks: ['AMEX', 'MASTERCARD', 'VISA', 'DISCOVER'],
        paymentMethodTokenizationParameters: {
          tokenizationType: 'NETWORK_TOKEN',
          parameters: {
            'publicKey': 'BC9u7amr4kFD8qsdxnEfWV7RPDR9v4gLLkx3jfyaGOvxBoEuLZKE0Tt5O/2jMMxJ9axHpAZD2Jhi4E74nqxr944=',
          }
        }
      }
    },
    {
      supportedMethods: ['basic-card'],
      data: {
        supportedNetworks: ['visa', 'mastercard', 'amex',
          'jcb', 'diners', 'discover', 'mir', 'unionpay']
      }
    }];

    const paymentOptions = {
      requestShipping: true,
      requestPayerEmail: true,
      requestPayerPhone: true,
      requestPayerName: true
    };

    let shippingOptions = [];
    let selectedOption = null;

    let details = this.buildPaymentDetails(cart, shippingOptions, selectedOption);

    let request = new PaymentRequest(supportedInstruments, details, paymentOptions);

    request.addEventListener('shippingaddresschange', e => {
      e.updateWith((_ => {
        // Get the shipping options and select the least expensive
        shippingOptions = this.optionsForCountry(request.shippingAddress.country);
        selectedOption = shippingOptions[0].id;
        let details = this.buildPaymentDetails(cart, shippingOptions, selectedOption);
        return Promise.resolve(details);
      })());
    });
    request.addEventListener('shippingoptionchange', e => {
      e.updateWith((_ => {
        selectedOption = request.shippingOption;
        let details = this.buildPaymentDetails(cart, shippingOptions, selectedOption);
        return Promise.resolve(details);
      })());
    });

    return request;
  }

  buildPaymentDetails(cart, shippingOptions, shippingOptionId) {
    let displayItems = cart.cart.map(item => {
      return {
        label: `${item.sku}: ${item.quantity}x $${item.price}`,
        amount: {currency: 'USD', value: String(item.total)}
      };
    });
    let total = cart.total;

    let displayedShippingOptions = [];
    if (shippingOptions.length > 0) {
      let selectedOption = shippingOptions.find(option => {
        return option.id === shippingOptionId;
      });
      displayedShippingOptions = shippingOptions.map(option => {
        return {
          id: option.id,
          label: option.label,
          amount: {currency: 'USD', value: String(option.price)},
          selected: option.id === shippingOptionId
        };
      });
      if (selectedOption) total += selectedOption.price;
    }

    let details = {
      displayItems: displayItems,
      total: {
        label: 'Total due',
        amount: {currency: 'USD', value: String(total)}
      },
      shippingOptions: displayedShippingOptions
    };

    return details;
  }

  optionsForCountry(country) {
    country = country.toLowerCase();
    if (!country || !SHIPPING_OPTIONS.hasOwnProperty(country)) {
      country = 'international';
    }
    let options = SHIPPING_OPTIONS[country];
    options.sort((a, b) => {
      return a.price - b.price;
    });
    return options;
  }

}
