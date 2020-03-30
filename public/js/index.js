/* eslint-disable */

import '@babel/polyfill';
import { displayMap } from './mapBox';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';

//DOM elements
const mapBox = document.getElementById('map');
const LoginForm = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const UserDataForm = document.querySelector('.form-user-data');
const UserPasswordForm = document.querySelector(
  '.form-user-password'
);
const bookBtn = document.getElementById('book-tour');

//Values

//Delegations
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  console.log(locations);
  displayMap(locations);
}

if (LoginForm) {
  LoginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}

if (UserDataForm) {
  UserDataForm.addEventListener('submit', e => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    updateSettings(form, 'data');
  });
}

if (UserPasswordForm) {
  UserPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();
    document.querySelector('.btn--save-pasword').textContent =
      'Updating...';
    const passwordCurrent = document.getElementById(
      'password-current'
    ).value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById(
      'password-confirm'
    ).value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );

    document.querySelector('.btn--save-pasword').textContent =
      'Save Password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

if (bookBtn) {
  bookBtn.addEventListener('click', e => {
    e.target.textContent = 'Processing';
    const tourId = e.target.dataset.tourId;
    bookTour(tourId);
  });
}
