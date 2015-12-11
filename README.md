# np-solo
This is a simple private npm registry. No service dependencies. User registration will be through a config file and now command line. It was designed to work as a scoped private registry so it will not cache public npm service.

To install execute
```
npm install np-solo -g
```

To start the registry execute in the directory of your configuration (np-solo.json) file. All paths will be relative to this location.
```
np-solo
```

np-solo.json will store all of your configuration settings. Below is a description of the possible settings.

```javascript
{
  // Which port for the server to bind
  port: 9000,
  // A specifc hostname or ip address to bind
  hostname: undefined,
  // Allow unauthenticated users, this can also be an object that will have specify 
  // options for read or write.
  // { read: true, write: false }
  allowAnonymous: false,
  // Configure how the registry will store the json and tar files. This can be a plain object
  // that will require default providers (currently only local is supported). You can also require your
  // own class that confirms to the storage contract for specific implementations.
  storageProvider: {
		type: 'local',
		options: {
			dir: './storage'
		}
	},
	// Configure how the registry will authenticate users. Users will typically be stored in the config file.
	authProvider: {
		type: 'simple',
		options: {
			// Which hash algorithm to use when authenticating users. [See Node Docs](https://nodejs.org/api/crypto.html#crypto_crypto_createhash_algorithm)
			hashAlgorithm: 'sha512',
			users: {}
		}
	}
}
```

Example np-solo.json file:
```javascript
{
	"authProvider": {
		"options": {
			"users": {
				"test": {
					"password": "ee26b0dd4af7e749aa1a8ee3c10ae9923f618980772e473f8819a5d4940e0db27ac185f8a0e1d5f84f88bc887fd67b143732c304cc5fa9ad8e6f57f50028a8ff",
					"email": "test@test.com",
					"token": "6c84fb90-12c4-11e1-840d-7b25c5ee775a",
					"can": {
						"write": true,
						"read": true
					}
				}
			}
		}
	}
}
```
