import {pwaInfo} from 'virtual:pwa-info';
import {fetchData} from './functions';
// import {UpdateResult} from './interfaces/UpdateResult';
import {UploadResult} from './interfaces/UploadResult';
import {LoginUser, User} from './interfaces/User';
import {apiUrl, uploadUrl} from './variables';
import {registerSW} from 'virtual:pwa-register';
import {errorModal, restaurantModal, restaurantRow, weekModal} from './components';
import {Restaurant} from './interfaces/Restaurant';
import { Menu, WeeklyMenu } from './interfaces/Menu';
import { map, latLng, tileLayer, MapOptions } from "leaflet";
import L from 'leaflet';


// PWA code
console.log(pwaInfo);

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('onNeedRefresh');
    const update = confirm('New version available. Update?');
    if (update) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('onOfflineReady');
    alert('App is offline ready');
  },
});

// select forms from the DOM
const loginForm = document.querySelector('#login-form');
// const profileForm = document.querySelector('#profile-form');
const avatarForm = document.querySelector('#avatar-form');

// select inputs from the DOM
const usernameInput = document.querySelector(
  '#username'
) as HTMLInputElement | null;
const passwordInput = document.querySelector(
  '#password'
) as HTMLInputElement | null;

const profileUsernameInput = document.querySelector(
  '#profile-username'
) as HTMLInputElement | null;
const profileEmailInput = document.querySelector(
  '#profile-email'
) as HTMLInputElement | null;

const avatarInput = document.querySelector(
  '#avatar'
) as HTMLInputElement | null;

// select profile elements from the DOM
const usernameTarget = document.querySelector('#username-target');
const emailTarget = document.querySelector('#email-target');
const avatarTarget = document.querySelector('#avatar-target');

// TODO: function to login
const login = async (user: {
  username: string;
  password: string;
}): Promise<LoginUser> => {
  const options: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  };
  return await fetchData<LoginUser>(apiUrl + '/auth/login', options);
};

// TODO: funtion to upload avatar
const uploadAvatar = async (
  image: File,
  token: string
): Promise<UploadResult> => {
  const formData = new FormData();
  formData.append('avatar', image);

  const options: RequestInit = {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
    },
    body: formData,
  };
  return await fetchData(apiUrl + '/users/avatar', options);
};
/*
// TODO: function to update user data
const updateUserData = async (
  user: UpdateUser,
  token: string
): Promise<UpdateResult> => {};
*/

// TODO: function to add userdata (email, username and avatar image) to the
// Profile DOM and Edit Profile Form
const addUserDataToDom = (user: User): void => {
  if (
    !usernameTarget ||
    !emailTarget ||
    !avatarTarget ||
    !profileEmailInput ||
    !profileUsernameInput
  ) {
    return;
  }
  usernameTarget.innerHTML = user.username;
  emailTarget.innerHTML = user.email;
  (avatarTarget as HTMLImageElement).src = uploadUrl + user.avatar;

  profileEmailInput.value = user.email;
  profileUsernameInput.value = user.username;
};

// function to get userdata from API using token
const getUserData = async (token: string): Promise<User> => {
  const options: RequestInit = {
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };
  return await fetchData<User>(apiUrl + '/users/token', options);
};

// TODO: function to check local storage for token and if it exists fetch
// userdata with getUserData then update the DOM with addUserDataToDom
const checkToken = async (): Promise<void> => {
  const token = localStorage.getItem('token');
  if (!token) {
    return;
  }
  const userData = await getUserData(token);
  addUserDataToDom(userData);
};

// call checkToken on page load to check if token exists and update the DOM
checkToken();

// TODO: login form event listener
// event listener should call login function and save token to local storage
// then call addUserDataToDom to update the DOM with the user data
loginForm?.addEventListener('submit', async (evt) => {
  evt.preventDefault();
  if (!usernameInput || !passwordInput) {
    return;
  }
  const user = {
    username: usernameInput.value,
    password: passwordInput.value,
  };
  const loginData = await login(user);
  console.log(loginData);
  // alert(loginData.message);
  localStorage.setItem('token', loginData.token);
  addUserDataToDom(loginData.data);
});

// TODO: profile form event listener
// event listener should call updateUserData function and update the DOM with
// the user data by calling addUserDataToDom or checkToken

// TODO: avatar form event listener
// event listener should call uploadAvatar function and update the DOM with
// the user data by calling addUserDataToDom or checkToken
avatarForm?.addEventListener('submit', async (evt) => {
  evt.preventDefault();
  if (!avatarInput?.files) {
    return;
  }
  const image = avatarInput.files[0];

  const token = localStorage.getItem('token');
  if (!token) {
    return;
  }

  const avatarData = await uploadAvatar(image, token);
  console.log(avatarData);
  checkToken();
});


const modal = document.querySelector('dialog');
if (!modal) {
  throw new Error('Modal not found');
}


//TODO: function to take restaurant list and put it in the website

const positionOptions = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};

const calculateDistance = (x1: number, y1: number, x2: number, y2: number) =>
  Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

const createTable = (restaurants: Restaurant[]) => {
  const table = document.querySelector('table');
  if (!table) {
    throw new Error ("Null table!");
  }
  table.innerHTML = '';
  restaurants.forEach((restaurant) => {
    const tr = restaurantRow(restaurant);
    table.appendChild(tr);
    tr.addEventListener('click', async () => {
      try {
        // remove all highlights
        const allHighs = document.querySelectorAll('.highlight');
        allHighs.forEach((high) => {
          high.classList.remove('highlight');
        });

        // add highlight
        tr.classList.add('highlight');

        // add restaurant data to modal
        modal.innerHTML = '';

        // fetch menu
        const menu = await fetchData<Menu>(
          apiUrl + `/restaurants/daily/${restaurant._id}/fi`
        );
        console.log(menu);

        const menuHtml = restaurantModal(restaurant, menu);
        modal.insertAdjacentHTML('beforeend', menuHtml);

        const closebutton = document.querySelector('#closebutton');
        closebutton?.addEventListener('click', () => {
          modal.close();

          const allHighs = document.querySelectorAll('.highlight');
          allHighs.forEach((high) => {
            high.classList.remove('highlight');
          });
        });

        const weeklymenu = await fetchData<WeeklyMenu>(
          apiUrl + `/restaurants/weekly/${restaurant._id}/fi`
        );

        const weeklybutton = document.querySelector('#weeklymenu');
        const menuTable = document.querySelector(".tabletest");
        weeklybutton?.addEventListener('click', () => {
          console.log(weeklymenu);
          menuTable?.remove();

          const weekMenu = weekModal(weeklymenu);
          modal.insertAdjacentHTML('beforeend', weekMenu);
        })

        modal.showModal();
      } catch (error) {
        modal.innerHTML = errorModal((error as Error).message);
        modal.showModal();
      }
    });
  });
};

const error = (err: GeolocationPositionError) => {
  console.warn(`ERROR(${err.code}): ${err.message}`);
};

const success = async (pos: GeolocationPosition) => {
  try {
    const crd = pos.coords;
    const restaurants = await fetchData<Restaurant[]>(apiUrl + '/restaurants');
    console.log(restaurants);
    restaurants.sort((a, b) => {
      const x1 = crd.latitude;
      const y1 = crd.longitude;
      const x2a = a.location.coordinates[1];
      const y2a = a.location.coordinates[0];
      const distanceA = calculateDistance(x1, y1, x2a, y2a);
      const x2b = b.location.coordinates[1];
      const y2b = b.location.coordinates[0];
      const distanceB = calculateDistance(x1, y1, x2b, y2b);
      return distanceA - distanceB;
    });
    createTable(restaurants);
    // buttons for filtering
    const sodexoBtn = document.querySelector('#sodexo');
    const compassBtn = document.querySelector('#compass');
    const resetBtn = document.querySelector('#reset');

    if (!sodexoBtn || !compassBtn || !resetBtn) {
      throw new Error ('Button not found!');
    }
    sodexoBtn.addEventListener('click', () => {
      const sodexoRestaurants = restaurants.filter(
        (restaurant) => restaurant.company === 'Sodexo'
      );
      console.log(sodexoRestaurants);
      createTable(sodexoRestaurants);
    });

    compassBtn.addEventListener('click', () => {
      const compassRestaurants = restaurants.filter(
        (restaurant) => restaurant.company === 'Compass Group'
      );
      console.log(compassRestaurants);
      createTable(compassRestaurants);
    });

    resetBtn.addEventListener('click', () => {
      createTable(restaurants);
    });

    for (const spot of restaurants) {
      const marker = L.marker([
        spot.location.coordinates[1],
        spot.location.coordinates[0],
      ]).addTo(mymap);

      marker.bindPopup(`<h3>${spot.name}</h3><p>${spot.address}</p><p>${spot.phone}</p>`);
    };

  } catch (error) {
    modal.innerHTML = errorModal((error as Error).message);
    modal.showModal();
  }
};

navigator.geolocation.getCurrentPosition(success, error, positionOptions);

//TODO: function to make a dark mode and make it save its property to local storage
// selectors
const checkbox = document.getElementById("checkbox")
// state
const theme = localStorage.getItem("theme");
// on mount
theme && document.body.classList.add("dark");


// Addd an event listener to dark mode
checkbox.addEventListener("change", () => {
  document.body.classList.toggle("dark");

  //Darkmode to LocalStorage
  if (document.body.classList.contains("dark")) {
    localStorage.setItem("theme", "dark");
  } else {
  localStorage.removeItem("theme")
  }
})



//Checkbox to localsotrage

// Function to save checkbox value to localStorage



//TODO: function to make nav scroll to the page location
const frontPageButton = document.getElementById("mainNav");
const frontPageSection = document.querySelector("main");

const restaurantPageButton = document.getElementById("ResNav");
const restaurantPageSection = document.querySelector("#reset");

const locationPageButton = document.getElementById("LocNav");
const locationPageSection = document.querySelector(".mapcontainer");

const aboutUsPageButton = document.getElementById("AboutNav");
const aboutUsPageSection = document.querySelector(".aboutcontainer")

frontPageButton?.addEventListener("click", function(event){
  event.preventDefault();

  frontPageSection?.scrollIntoView({behavior:"smooth"});
});

restaurantPageButton?.addEventListener("click", function(event){
  event.preventDefault();

  restaurantPageSection?.scrollIntoView({behavior:"smooth"});
});

locationPageButton?.addEventListener("click", function(event){
  event.preventDefault();

  locationPageSection?.scrollIntoView({behavior:"smooth"});
});

aboutUsPageButton?.addEventListener("click", function(event){
  event.preventDefault();

  aboutUsPageSection?.scrollIntoView({behavior:"smooth"});
});

//TODO: function to fetch leaflet API
const options: MapOptions = {
  center: latLng(60.192059, 24.945831),
  zoom: 10,
};

const mymap = map('map', options);

tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(mymap);

