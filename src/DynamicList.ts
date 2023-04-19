import { RDM_Device } from "./RDM_Device";

type Filter = "None" | "Company NA" | "TMB";
type Sort = "None" | "UID" | "Manufacturer" | "Address";

export class DynamicList {
  private tableBody: HTMLElement;
  private filter: Filter = "None";
  private sort: Sort = "None";
  //order = true ascending / order = false descending
  private order = false;
  constructor(private _root: HTMLElement) {
    this.tableBody = this._root.querySelector(".table-body");

    this.initEvents();
  }

  initEvents() {
    this.tableBody.addEventListener("change", (e) => {
      const el = <HTMLInputElement>e.target;
      if (el.classList.contains("address")) {
        el.value = this.validateAddressRange(el.value);
      }
      console.log("UID:" + el.parentElement.parentElement.id + " " + el.value);
    });
  }

  createIndicatorEl(status: boolean) {
    const indicatorEl = document.createElement("td");
    indicatorEl.classList.add(status ? "online" : "offline");
    indicatorEl.classList.add("indicator");
    return indicatorEl;
  }

  createUidEl(uid: string) {
    const uidEl = document.createElement("td");
    uidEl.classList.add("uid");
    uidEl.innerHTML = uid;
    return uidEl;
  }

  createLabelEl(label: string) {
    const labelEl = document.createElement("td");
    const labelInputEl = document.createElement("input");
    labelInputEl.classList.add("input");
    labelInputEl.classList.add("label");
    labelInputEl.value = label;
    labelEl.appendChild(labelInputEl);
    return labelEl;
  }

  createManufacturerEl(manufacturer: string) {
    const manufacturerEl = document.createElement("td");
    manufacturerEl.classList.add("manufacturer");
    manufacturerEl.innerHTML = manufacturer;
    return manufacturerEl;
  }

  createModelEl(model: string) {
    const modelEl = document.createElement("td");
    modelEl.innerHTML = model;
    return modelEl;
  }

  createSelectEl(mode_index: number, mode_count: number) {
    const modeEl = document.createElement("td");
    const modeSelectEl = document.createElement("select");
    modeSelectEl.classList.add("input");
    modeSelectEl.classList.add("mode");
    for (let i = 1; i <= mode_count; i++) {
      const option = document.createElement("option");
      option.text = `Mode#${i}`;
      option.value = `Mode#${i}`;
      if (mode_index == i) {
        option.selected = true;
      }
      modeSelectEl.appendChild(option);
    }
    modeEl.appendChild(modeSelectEl);
    return modeEl;
  }

  createAddressEl(address: number) {
    const addressEl = document.createElement("td");
    const addressInputEl = document.createElement("input");
    addressInputEl.classList.add("input");
    addressInputEl.classList.add("address");
    addressInputEl.type = "number";
    addressInputEl.min = "1";
    addressInputEl.max = "512";
    addressInputEl.value = address.toString();
    addressEl.appendChild(addressInputEl);
    return addressEl;
  }

  addDevice(item: RDM_Device) {
    const newRow = document.createElement("tr");
    newRow.id = item.uid_integer.toString();
    newRow.classList.add("table-item");

    newRow.append(
      this.createIndicatorEl(item.is_online),
      this.createUidEl(item.uid),
      this.createLabelEl(item.label),
      this.createManufacturerEl(item.manufacturer),
      this.createModelEl(item.model),
      this.createSelectEl(item.mode_index, item.mode_count),
      this.createAddressEl(item.address)
    );

    return this.tableBody.appendChild(newRow);
  }

  rewriteDevice(device: Element, updatedDeviceData: RDM_Device) {
    if (this.sort != "None" || this.filter != "None") {
      this.sort = "None";
      this.filter = "None";
    }

    return device.replaceChildren(
      this.createIndicatorEl(updatedDeviceData.is_online),
      this.createUidEl(updatedDeviceData.uid),
      this.createLabelEl(updatedDeviceData.label),
      this.createManufacturerEl(updatedDeviceData.manufacturer),
      this.createModelEl(updatedDeviceData.model),
      this.createSelectEl(
        updatedDeviceData.mode_index,
        updatedDeviceData.mode_count
      ),
      this.createAddressEl(updatedDeviceData.address)
    );
  }

  updateDevice(updatedDevice: RDM_Device) {
    const foundDevice = this.findDeviceInTable(updatedDevice.uid_integer);

    if (!foundDevice) {
      return console.log("No such device was found!");
    }

    return this.rewriteDevice(foundDevice, updatedDevice);
  }

  setFilter(filter: Filter) {
    if (filter == this.filter) {
      return console.log(`Filter for ${filter} already applied!`);
    }

    const allDevices = this.getAllDevicesInTable();

    if (filter == "None") {
      allDevices.forEach((device) => {
        device.classList.remove("hidden");
      });

      return (this.filter = filter);
    }

    allDevices.forEach((device) => {
      if (!device.innerHTML.includes(filter)) {
        device.classList.add("hidden");
      }
      if (device.innerHTML.includes(filter)) {
        device.classList.remove("hidden");
      }
    });

    return (this.filter = filter);
  }

  sortByUid() {
    const allDevices = this.getAllDevicesInTable();
    //html element id == rdm_device.uid_integer
    if (this.sort == "UID" && this.order) {
      Array.from(allDevices)
        .sort((a, b) => parseInt(b.id) - parseInt(a.id))
        .forEach((tr) => this.tableBody.appendChild(tr));

      return (this.order = false);
    }

    this.sort = "UID";
    Array.from(allDevices)
      .sort((a, b) => parseInt(a.id) - parseInt(b.id))
      .forEach((tr) => this.tableBody.appendChild(tr));

    return (this.order = true);
  }

  sortByAddress() {
    const allDevices = this.getAllDevicesInTable();
    //html element id == rdm_device.uid_integer
    if (this.sort == "Address" && this.order) {
      Array.from(allDevices)
        .sort((a, b) => {
          const addressA = parseInt(
            a.querySelector<HTMLInputElement>(".address").value
          );
          const addressB = parseInt(
            b.querySelector<HTMLInputElement>(".address").value
          );
          if (addressA == addressB) {
            return parseInt(a.id) - parseInt(b.id);
          }

          return addressB - addressA;
        })
        .forEach((tr) => this.tableBody.appendChild(tr));

      return (this.order = false);
    }

    this.sort = "Address";
    Array.from(allDevices)
      .sort((a, b) => {
        const addressA = parseInt(
          a.querySelector<HTMLInputElement>(".address").value
        );
        const addressB = parseInt(
          b.querySelector<HTMLInputElement>(".address").value
        );
        if (addressA == addressB) {
          return parseInt(a.id) - parseInt(b.id);
        }

        return addressA - addressB;
      })
      .forEach((tr) => this.tableBody.appendChild(tr));

    return (this.order = true);
  }

  sortByManufacturer() {
    const allDevices = this.getAllDevicesInTable();
    if (this.sort == "Manufacturer" && this.order) {
      Array.from(allDevices)
        .sort((a, b) => {
          const manufacturerA = a
            .querySelector<HTMLInputElement>(".manufacturer")
            .innerText.toLowerCase(); // ignore upper and lowercase
          const manufacturerB = b
            .querySelector<HTMLInputElement>(".manufacturer")
            .innerText.toLowerCase(); // ignore upper and lowercase
          if (manufacturerA > manufacturerB) {
            return -1;
          }
          if (manufacturerA < manufacturerB) {
            return 1;
          }

          // names must be equal
          return parseInt(a.id) - parseInt(b.id);
        })
        .forEach((tr) => this.tableBody.appendChild(tr));

      return (this.order = false);
    }

    this.sort = "Manufacturer";
    Array.from(allDevices)
      .sort((a, b) => {
        const manufacturerA = a
          .querySelector<HTMLInputElement>(".manufacturer")
          .innerText.toLowerCase();
        const manufacturerB = b
          .querySelector<HTMLInputElement>(".manufacturer")
          .innerText.toLowerCase();
        if (manufacturerA < manufacturerB) {
          return -1;
        }
        if (manufacturerA > manufacturerB) {
          return 1;
        }

        // names must be equal
        return parseInt(a.id) - parseInt(b.id);
      })
      .forEach((tr) => this.tableBody.appendChild(tr));

    return (this.order = true);
  }

  findDeviceInTable(uid: BigInt) {
    return this.tableBody.querySelector(`[id='${uid}']`);
  }

  validateAddressRange(address: string) {
    if (parseInt(address) > 512) {
      return "512";
    }

    if (parseInt(address) < 1) {
      return "1";
    }

    return address;
  }

  getFilter() {
    return this.filter;
  }

  getSort() {
    return this.sort;
  }

  getAllDevicesInTable() {
    return this.tableBody.querySelectorAll<HTMLTableRowElement>(`.table-item`);
  }
}
