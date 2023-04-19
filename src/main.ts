import { DynamicList } from "./DynamicList";
import { RDM_Device } from "./RDM_Device";
import { Server } from "./Server";

window.onload = () => {
  main();
};

let g_Server: Server;
let g_DeviceList: DynamicList;

function main() {
  g_Server = new Server({
    device_added_callback: (device_data: RDM_Device) => {
      // Called when a new RDM Device has been discovered.
      // Create an RDM Device entry in the RDM Device List with the values in device_data.
      g_DeviceList.addDevice(device_data);
      updateTableInfo();
    },
    device_updated_callback: (device_data: RDM_Device) => {
      // Called when an RDM Device parameter change is detected.
      // Update existing associated RDM Device entry in the RDM Device List with the values in device_data.
      g_DeviceList.updateDevice(device_data);
      updateTableInfo();
    },
  });

  document.getElementById("filter_none").onclick = () => {
    g_DeviceList.setFilter("None");
    updateTableInfo();
  };

  document.getElementById("filter_na").onclick = () => {
    g_DeviceList.setFilter("Company NA");
    updateTableInfo();
  };

  document.getElementById("filter_tmb").onclick = () => {
    g_DeviceList.setFilter("TMB");
    updateTableInfo();
  };

  document.getElementById("sort_uid").onclick = () => {
    g_DeviceList.sortByUid();
    updateTableInfo();
  };

  document.getElementById("sort_address").onclick = () => {
    g_DeviceList.sortByAddress();
    updateTableInfo();
  };

  document.getElementById("sort_manufacturer").onclick = () => {
    //could use sortByUid for this also
    g_DeviceList.sortByManufacturer();
    updateTableInfo();
  };

  g_DeviceList = new DynamicList(document.getElementById("rdm_device_list"));
}

const updateTableInfo = () => {
  const hiddenCount = document.querySelectorAll(".hidden").length;
  const visibleCount = document.querySelector(".visible__count");
  const fullCount = document.querySelector(".full__count");
  const filter = document.querySelector(".filter__mode");
  const sort = document.querySelector(".sort__mode");
  visibleCount.innerHTML = String(g_Server.GetDeviceCount() - hiddenCount);
  fullCount.innerHTML = String(g_Server.GetDeviceCount());
  filter.innerHTML = g_DeviceList.getFilter();
  sort.innerHTML = g_DeviceList.getSort();
};
