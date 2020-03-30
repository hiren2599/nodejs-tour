/* eslint-disable*/
import axios from 'axios';

import { showAlert } from './alerts';

const stripe = Stripe('pk_test_wPQBO5c91QLjg4faWCMrBCLx000JrwCGsl');

export const bookTour = async tourId => {
  try {
    //1) Get checkout session from API
    const session = await axios(
      `/api/v1/bookings/checkout-session/${tourId}`
    );

    //2) Create checkout form+ charge credit card

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    showAlert('error', err);
  }
};
