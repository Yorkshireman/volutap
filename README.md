# Counter

## Creating and installing a development build on a physical iPhone

- `npx expo run:ios -d`
- Choose physical iPhone (should show up if usb connected or on same network with no VPNs on)

Once built (`development` build) it should install the app on the phone and start it.

## Running an existing development on a physical iPhone

- `npm run start-dev-client`
- Scan QR code with phone

VPNs can interfere; VPNs need to be configured to allow LAN Traffic and may need to be off on initial app start.

### Using EAS

- `eas build --profile development --platform ios`
- When finished, install app onto physical iPhone using the presented QR code
- `npm run start-dev-client`
- Scan QR Code to open on physical iPhone

Code changes will be reflected on device but dependency changes will not be - those need fresh builds.

NB not possible to run in Expo Go due to `react-native-volume-manager` dependency
