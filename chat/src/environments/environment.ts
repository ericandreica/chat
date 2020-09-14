// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebase:{
    apiKey: 'xyz',
    authDomain: 'chat-56d80.firebaseapp.com',
    databaseURL: 'https://chat-56d80.firebaseio.com',
    projectId: 'chat-56d80',
    storageBucket: 'chat-56d80.appspot.com',
    messagingSenderId: 'xyz',
    appId: 'xyz',
    measurementId: 'xyz'
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
