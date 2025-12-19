const consoleButton = document.getElementById('console-button');
consoleButton.onclick = async () => await window.pooolLaunchpadApp
  .openDevTools()

const initButton = document.getElementById('init-launchpad');
initButton.onclick = async () => await window.pooolLaunchpadApp
  .initLaunchPad()

// Écouter les boutons
window.launchpad.onButton((button) => {
  console.log('Bouton reçu dans le renderer:', button);
  
  // Jouer un son, etc.
  if (button.pressed) {
    playSound(button.x, button.y);
  }
});


function getDeviceDetails (device) {
  return device.productName || `Unknown device ${device.deviceId}`
}

async function testIt () {
  const noDevicesFoundMsg = 'No devices found'
  const grantedDevices = await navigator.usb.getDevices();
  console.log({ grantedDevices });
  
  const launchPadMk2 = grantedDevices.find((device) => {
    console.log("device : ", device);
    
    return device.productName === 'Launchpad MK2';
  });

  console.log("launchpad : ", launchPadMk2);
  launchPadMk2?.open();
  

  let grantedDeviceList = ''
  if (grantedDevices.length > 0) {
    for (const device of grantedDevices) {
      grantedDeviceList += `<hr>${getDeviceDetails(device)}</hr>`
    }
  } else {
    grantedDeviceList = noDevicesFoundMsg
  }
  document.getElementById('granted-devices').innerHTML = grantedDeviceList

  grantedDeviceList = ''
  try {
    const grantedDevice = await navigator.usb.requestDevice({
      filters: []
    })
    grantedDeviceList += `<hr>${getDeviceDetails(grantedDevice)}</hr>`
  } catch (ex) {
    if (ex.name === 'NotFoundError') {
      grantedDeviceList = noDevicesFoundMsg
    }
  }
  document.getElementById('granted-devices2').innerHTML = grantedDeviceList
}

document.getElementById('clickme').addEventListener('click', testIt)