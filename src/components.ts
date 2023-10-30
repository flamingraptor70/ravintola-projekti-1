
import { Menu, WeeklyMenu } from "./interfaces/Menu";
import { Restaurant } from "./interfaces/Restaurant";

const restaurantRow = (restaurant: Restaurant) => {
  const {name, address, company} = restaurant;
  const tr = document.createElement('tr');
  const nameCell = document.createElement('td');
  nameCell.innerText = name;
  const addressCell = document.createElement('td');
  addressCell.innerText = address;
  const companyCell = document.createElement('td');
  companyCell.innerText = company;

  tr.appendChild(nameCell);
  tr.appendChild(addressCell);
  tr.appendChild(companyCell);
  return tr;
};

const restaurantModal = (restaurant: Restaurant, menu: Menu) => {
  const {name, address, city, postalCode, phone, company} = restaurant;
  let html = `<h3>${name}</h3>
    <p class="menuinfo">Company: ${company}</p>
    <p class="menuinfo">Address: ${address}, ${postalCode}, ${city}</p>
    <p class="menuinfo">Phone: ${phone}</p>
    <button id="weeklymenu">Show weekly menu</button>
    <table class="tabletest">
      <tr>
        <th class="menutop">Course</th>
        <th class="menutop">Diet</th>
        <th class="menutop">Price</th>
      </tr>
    `;
  menu.courses.forEach((course) => {
    const {name, diets, price} = course;
    html += `
          <tr>
            <td class="coursename">${name}</td>
            <td>${diets ?? ' - '}</td>
            <td>${price ?? ' - '}</td>
          </tr>
          `;
  });
  html += '</table><button id="closebutton">Close</button>';
  return html;
};

const weekModal = (weeklymenu: WeeklyMenu) => {
  let html = `
  <h3>Week menu</h2>`;
      weeklymenu.days.forEach((menu) => {
      const {date} = menu;
      html += `
      <table>
      <h3>${date}</h3>
      <tr>
          <th class="menutop">Course</th>
          <th class="menutop">Diet</th>
          <th class="menutop">Price</th>`;
      menu.courses.forEach((course) => {
        const {name, diets, price} = course;
        html += `
        <tr>
          <td class="coursename">${name}</td>
          <td>${diets ?? ' - '}</td>
          <td>${price ?? ' - '}</td>
        </tr>
        `;})
        })
        html += `</table>`
        return html;
  };

const errorModal = (message: string) => {
  const html = `
        <h3>Error</h3>
        <p>${message}</p>
        `;
  return html;
};

export {restaurantRow, restaurantModal, errorModal, weekModal};
