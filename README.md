# VoluTap

## Creating and installing a development build on a physical iPhone

- `eas env:pull --environment development` - this should create a `.env.local` file and populate it with the `AMPLITUDE_API_KEY` key/value pair that is hosted at https://expo.dev/accounts/codedegen/projects/volutap/environment-variables
- If the app's dependencies have been changed, run `npx expo prebuild -p ios`
- `npx expo run:ios -d`
- Choose physical iPhone (should show up if usb connected or on same network with no VPNs on)

Once built (`development` build) it should install the app on the phone and start it.

## Running an existing development build on a physical iPhone

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

## Releasing

When bumping the app version, make sure the `appVersion` in `setupAnalytics.ts` is also updated.

- `eas build --profile production --platform ios`
- `eas submit --platform ios`
- Test through Testflight
- Submit build for review at https://appstoreconnect.apple.com when ready
