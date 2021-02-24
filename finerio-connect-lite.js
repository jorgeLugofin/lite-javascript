// Using NodeJS 15.9.0

const axios = require( 'axios' );
const querystring = require( 'querystring' );
const crypto = require( 'crypto' );
const constants = require( 'constants' );

class Bank {

  constructor( id, name, status ) {
    this.id = id;
    this.name = name;
    this.status = status;
  }

}

class ErrorMessage {

  constructor( code, key, description, text ) {
    this.code = code;
    this.key = key;
    this.description = description;
    this.text = text;
  }

}

class Callback {

  constructor( id, url, nature ) {
    this.id = id;
    this.url = url;
    this.nature = nature;
  }

}

class CreateCallback {

  constructor( url, nature ) {
    this.url = url;
    this.nature = nature;
  }

}

class Credential {

  constructor( id, username, dateCreated ) {
    this.id = id;
    this.username = username;
    this.dateCreated = dateCreated;
  }

}

class CreateCredential {

  constructor( customId, bankId, username, password ) {
    this.customId = customId;
    this.bankId = bankId;
    this.username = username;
    this.password = password;
  }

}

class Error {

  constructor( code, title, detail ) {
    this.code = code;
    this.title = title;
    this.detail = detail;
  }

}

class Errors {

  constructor( errors ) {
    this.errors = errors;
  }

}

class FinerioConnectLite {

  #publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAv1STVY1D8uelL+j4Tm0z
sgOsgof3KMsmWUIyvLtKUnH5SBrcPqEbjI5+gwRTwc1d5QcGWqEgx2uSUSaOdDWy
TR6mKG8iSMYWEtEeCI/LmwAKGapGDB/ciguhXzsjVa9dZThlHvW4XiHWEIenxzba
hXexBuEQfSP9DiJuM9yRqHX60+aCJxupRtLgaWQkTtFGI5tGQ1tMN0qZW7eat//r
vzHrp4MU2EOVXiRE06ypWRQhni8zY+VaNPjXHybPC+dIiXspBqwaySKBKqNVZCXt
qVa7ouJfXs3HUrpthJqQ30cPefEt0jAFj6QRJDsGwKTXS3gq7mGz3AYq0Be2LuTD
1wIDAQAB
-----END PUBLIC KEY-----`;

  #serverUrl;

  // Access attributes
  #username;
  #password;
  #accessToken;
  #refreshToken;
  #expiresIn;
  #lastTokenFetchingTime;

  constructor( serverUrl, username, password ) {

    this.#serverUrl = serverUrl;
    this.#username = username;
    this.#password = password;

  }

  getBanks() {

    let url = `${this.#serverUrl}/banks`;
    return this.doGet( url, this.processBanksResponse, this );

  }

  getErrorMessages() {

    let url = `${this.#serverUrl}/credentials/messages/failure`;
    return this.doGet( url, this.processErrorMessagesResponse, this );

  }

  createCallback( dto ) {

    let url = `${this.#serverUrl}/callbacks`;
    return this.doPost( url, dto,
        this.processCallbackResponse, this );

  }

  getCallbacks() {

    let url = `${this.#serverUrl}/callbacks`;
    return this.doGet( url, this.processCallbacksResponse, this );

  }

  getCallback( id ) {

    let url = `${this.#serverUrl}/callbacks/${id}`;
    return this.doGet( url, this.processCallbackResponse, this );

  }

  updateCallback( id, newUrl ) {

    let url = `${this.#serverUrl}/callbacks/${id}`;
    let body = { url: newUrl };
    return this.doPut( url, body, this.processCallbackResponse, this );

  }

  deleteCallback( id ) {

    let url = `${this.#serverUrl}/callbacks/${id}`;
    return this.doDelete( url, this );

  }

  createCredential( dto ) {

    let url = `${this.#serverUrl}/credentials`;
    dto.username = this.encrypt( dto.username );
    dto.password = this.encrypt( dto.password );
    return this.doPost( url, dto,
        this.processCredentialResponse, this );

  }

  doGet( url, successFunction, component ) {

    return this.getAccessToken().then( function( accessToken ) {

      return new Promise( ( resolve, reject ) => {

        let headers = { 'Authorization': `Bearer ${accessToken}` };

        axios.get( url, { headers: headers } )
          .then( response =>
            resolve( successFunction( response, component ) )
          ).catch( error =>
            component.processErrors( error, component, reject )
          );

      });

    }).catch( function( error ) {
      throw error;
    });

  }

  doPost( url, body, successFunction, component ) {

    return this.getAccessToken().then( function( accessToken ) {

      return new Promise( ( resolve, reject ) => {

        let headers = { 'Authorization': `Bearer ${accessToken}` };

        axios.post( url, body, { headers: headers } )
          .then( response =>
            resolve( successFunction( response, component ) )
          ).catch( error =>
            component.processErrors( error, component, reject )
          );

      });

    }).catch( function( error ) {
      throw error;
    });

  }

  doPut( url, body, successFunction, component ) {

    return this.getAccessToken().then( function( accessToken ) {

      return new Promise( ( resolve, reject ) => {

        let headers = { 'Authorization': `Bearer ${accessToken}` };

        axios.put( url, body, { headers: headers } )
          .then( response =>
            resolve( successFunction( response, component ) )
          ).catch( error =>
            component.processErrors( error, component, reject )
          );

      });

    }).catch( function( error ) {
      throw error;
    });

  }

  doDelete( url, component ) {

    return this.getAccessToken().then( function( accessToken ) {

      return new Promise( ( resolve, reject ) => {

        let headers = { 'Authorization': `Bearer ${accessToken}` };

        axios.delete( url, { headers: headers } )
          .then( response => resolve() )
          .catch( error =>
            component.processErrors( error, component, reject )
          );

      });

    }).catch( function( error ) {
      throw error;
    });

  }

  getAccessToken() {

    let component = this;

    return new Promise( ( resolve, reject ) => {

      if ( component.#accessToken == null ) {
        resolve( component.login() );
      } else {

        let maxMillisecondsToRefresh = 5000;
        let now = new Date().getTime();
        let tokenLimitTime = component.#lastTokenFetchingTime +
            ( component.#expiresIn * 1000 ) - maxMillisecondsToRefresh;

        if ( tokenLimitTime < now ) {
          resolve( component.refreshToken() );
        } else {
          resolve( component.#accessToken );
        }

      }

    });

  }

  login() {

    let url = `${this.#serverUrl}/login`;
    let body = { username: this.#username, password: this.#password };
    let component = this;

    return new Promise( ( resolve, reject ) => {

      axios.post( url, body )
        .then( function( response ) {
          component.processLoginResponse( response )
          resolve( component.#accessToken );
        } )
        .catch( function( error ) {
          reject( error );
        } );

    });

  }

  refreshToken() {

    let url = `${this.#serverUrl}/oauth/access_token`;
    let headers = { 'Content-type': 'application/x-www-form-urlencoded' };
    let body = querystring.stringify( {
      'refresh_token': this.#refreshToken,
      'grant_type': 'refresh_token'
    } );
    let component = this;

    return new Promise( ( resolve, reject ) => {

      axios.post( url, body, { headers: headers } )
        .then( function( response ) {
          component.processLoginResponse( response )
          resolve( component.#accessToken );
        } )
        .catch( function( error ) {
          reject( error );
        } );

    });

  }

  processBanksResponse( response, component ) {

    var banks = [];
    let banksJsonList = response.data.data;

    banksJsonList.forEach( bank =>
      banks.push( new Bank(
        bank.id,
        bank.name,
        bank.status
      ) )
    );

    return banks;

  }

  processErrorMessagesResponse( response, component ) {

    var errorMessages = [];
    let jsonList = response.data.data;

    jsonList.forEach( errorMessage =>
      errorMessages.push( new ErrorMessage(
        errorMessage.code,
        errorMessage.key,
        errorMessage.description,
        errorMessage.text
      ) )
    );

    return errorMessages;

  }

  processCallbacksResponse( response, component ) {

    var callbacks = [];
    let jsonList = response.data.data;

    jsonList.forEach( callback =>
      callbacks.push( component.createCallbackObject( callback ) )
    );

    return callbacks;

  }

  processCallbackResponse( response, component ) {
    return component.createCallbackObject( response.data );
  }

  processLoginResponse( response ) {

    let data = response.data;
    this.#accessToken = data.access_token;
    this.#refreshToken = data.refresh_token;
    this.#expiresIn = data.expiresIn;
    this.#lastTokenFetchingTime = new Date().getTime();

  }

  processErrors( error, component, reject ) {

    if ( error.response.status == 400 ) {
      reject( component.createErrorsObject(
          error.response.data ) );
    } else if ( error.response.status == 404 ) {
      reject( component.create404Error() );
    }

  }

  processCredentialResponse( response, component ) {
    return component.createCredentialObject( response.data );
  }

  createCallbackObject( callback, component ) {
    return new Callback(
      callback.id,
      callback.url,
      callback.nature
    );

  }

  createCredentialObject( credential, component ) {
    return new Credential(
      credential.id,
      credential.username,
      credential.dateCreated
    );

  }

  createErrorsObject( errors, component ) {

    var errorsList = [];

    errors.errors.forEach( error => {
      errorsList.push( new Error(
        error.code,
        error.title,
        error.detail
      ));
    });

    return new Errors( errorsList );

  }

  create404Error() {
    return new Errors(
      [
        new Error(
          'item.not.found',
          'Item not found',
          'The item you requested was not found'
        )
      ]
    );
  }

  encrypt( textToEncrypt ) {

    let buffer = Buffer.from( textToEncrypt );
    let encrypted = crypto.publicEncrypt(
        { key: this.#publicKey, padding: constants.RSA_PKCS1_PADDING },
        buffer );
    return encrypted.toString( 'base64' );

  }

}

module.exports = {
  FinerioConnectLite: FinerioConnectLite,
  CreateCallback: CreateCallback,
  CreateCredential: CreateCredential
}

