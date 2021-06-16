# Finerio Connect Lite API JavaScript SDK #

This SDK lets you connect to [Finerio Connect Lite API](https://lite-api-docs.finerioconnect.com/) in an easier way.

## Table of contents ##

* [Installation](#installation)
* [Setup](#setup)
* [Usage](#usage)
    * [Get available banks](#get-available-banks)
    * [Get bank fields](#get-bank-fields)
    * [Get credential error messages](#get-credential-error-messages)
    * [Get callbacks](#get-callbacks)
    * [Get a callback](#get-a-callback)
    * [Register a callback](#register-a-callback)
    * [Update a callback](#update-a-callback)
    * [Delete a callback](#delete-a-callback)
    * [Register a credential](#register-a-credential)

## Installation ##

NPM:

```
npm install finerio-connect-lite
```

## Setup ##

```javascript
let fcLite = require( 'finerio-connect-lite' );
let FinerioConnectLite = fcLite.FinerioConnectLite;

let serverUrl = 'https://lite.finerioconnect.com';
let username = 'yourUsername';
let password = 'yourPassword';

let finerioConnectLite = new FinerioConnectLite(
  serverUrl, username, password
);
```

## Usage ##

Finerio Connect Lite SDK uses **Promises** to fetch responses from the API.


### Get available banks ###

```javascript
finerioConnectLite.getBanks()
  .then( data => console.log( data ) ) 
  .catch( error => console.log( error ) );
```

Output:

```console
[
  Bank { id: 1, name: 'BBVA Bancomer', status: 'ACTIVE' },
  Bank { id: 2, name: 'Citibanamex', status: 'ACTIVE' },
...
]
```

### Get bank fields ###

```javascript
finerioConnectLite.getBankFields( bankId )
  .then( data => console.log( data ) ) 
  .catch( error => console.log( error ) );
```

Output:

```console
[
  BankField {
    name: 'username',
    friendlyName: 'Usuario',
    position: 1,
    type: '1',
    required: true
  },
...
]
```

### Get credential error messages ###

```javascript
finerioConnectLite.getErrorMessages()
  .then( data => console.log( data ) ) 
  .catch( error => console.log( error ) );
```

Output:

```console
[
  ErrorMessage {
    code: 203,
    key: 'account_blocked',
    description: 'Online banking account blocked',
    text: 'Tu banca en línea está bloqueada. Sigue el procedimiento de tu banco para desbloquearla e intenta nuevamente sincronizar tu cuenta.'
  },
  ErrorMessage {
    code: 504,
    key: 'gateway_timeout',
    description: 'Gateway timeout',
    text: 'Hubo un problema de conexión con tu banco. Sincroniza tu cuenta nuevamente en 5 minutos.'
  },
...
]
```

### Get callbacks ###

```javascript
finerioConnectLite.getCallbacks()
  .then( data => console.log( data ) )
  .catch( error => console.log( error ) );
```

Output:

```console
[
  Callback {
    id: 1,
    url: 'https://yourccompany.com/success/callback',
    nature: 'SUCCESS'
  },
  Callback {
    id: 1,
    url: 'https://yourcompany.com/failure/callback',
    nature: 'FAILURE'
  },
...
]
```

### Get a callback ###

```javascript
let callbackId = 1;
finerioConnectLite.getCallback( callbackId )
  .then( data => console.log( data ) )
  .catch( error => console.log( error ) );
```

Output:

```console
Callback {
  id: 1,
  url: 'https://yourccompany.com/success/callback',
  nature: 'SUCCESS'
}
```

### Register a callback ###

```javascript
let CreateCallback = fcLite.CreateCallback;

...

let dto = new CreateCallback(
  'https://yourccompany.com/success/callback',
  'SUCCESS'
);
finerioConnectLite.createCallback( dto )
  .then( data => console.log( data ) )
  .catch( error => console.log( error ) );
```

Output:

```console
Callback {
  id: 1,
  url: 'https://yourccompany.com/success/callback',
  nature: 'SUCCESS'
}
```

### Update a callback ###

```javascript
let callbackId = 1;
let newUrl = 'https://google.com';
finerioConnectLite.updateCallback( callbackId, newUrl )
  .then( data => console.log( data ) )
  .catch( error => console.log( error ) );
```

Output:

```console
Callback {
  id: 1,
  url: 'https://google.com',
  nature: 'SUCCESS'
}
```

### Delete a callback ###

```javascript
let callbackId = 1;
finerioConnectLite.deleteCallback( 1 )
  .then( () => console.log( 'Item deleted' ) )
  .catch( error => console.log( error ) );
```

There is no output from the API for this action.

### Register a credential ###

```javascript
let CreateCredential = fcLite.CreateCredential;

...

let customId = 'customId';
let bankId = 1;
let username = 'username';
let password = 'password';
let securityCode = 'securityCode';
let documenType = 'documentType';
let createCredentialDto = new CreateCredential( customId, bankId, username, password, securityCode, ddocumentType );
finerioConnectLite.createCredential( createCredentialDto )
  .then( data => console.log( data ) )
  .catch( error => console.log( error ) );
```

Output:

```console
Credential {
  id: '5422fb7e-0adb-4db2-a8e7-a892d04d2c95',
  username: 'username',
  dateCreated: 1614189618474
}
```

