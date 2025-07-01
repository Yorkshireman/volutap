# Counter

## Running locally on physical iPhone

- `eas build --profile development --platform ios`
- when finished, install app onto physical iPhone using the presented QR code
- `npm run start-dev-client`
- scan QR Code to open on physical iPhone

Code changes will be reflected on device but dependency changes will not be - those need fresh builds.

NB not possible to run in Expo Go due to `react-native-volume-manager` dependency
