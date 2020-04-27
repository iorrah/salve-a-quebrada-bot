var fs = require('fs');
var path = require('path');

function consoleLog(string) {
  console.log('>> ' + string);
}

function promiseAllP(items, block) {
  var promises = [];
  
  items.forEach(function(item, index) {
    promises.push( function(item, i) {
      return new Promise(function(resolve, reject) {
        return block.apply(this,[item,index,resolve,reject]);
      });
    }(item,index))
  });

  return Promise.all(promises);
}

function readFiles(dirname) {
  return new Promise((resolve, reject) => {
    fs.readdir(dirname, function(err, filenames) {
      if (err) return reject(err);
      _filenames = filenames.filter(filename => !(/(^|\/)\.[^\/\.]/g).test(filename));

      promiseAllP(_filenames, (filename, index, resolve, reject) => {
        fs.readFile(path.resolve(dirname, filename), 'utf-8', function(err, content) {
          if (err) return reject(err);
          return resolve({ filename: filename, contents: content });
        });
      })
      .then(results => {
          return resolve(results);
      })
      .catch(error => {
          return reject(error);
      });
    });
  });
}

var folder = 'data-test';

readFiles(folder)
.then(files => {
  consoleLog('Loaded ' + files.length + ' files');
  
  files.forEach((item, index) => {
    if (index < 10) {
      consoleLog('Now reading "' + item.filename + '"...');
      var content = JSON.parse(item.contents);
      var items = content.businesses;
      pushItemsToDB(items);
    }
  });
})
.catch(error => {
  consoleLog(error);
});

function pushItemsToDB(items) {
  var file = 'db.json';

  if (fs.existsSync(file)) {
    consoleLog('File "' + file + '" already exists');
    actuallyPushItemsToDB(items, file);
  } else {
    var json = {
      stores: [],
    };

    var stringJSON = JSON.stringify(json);

    fs.writeFile(file, stringJSON, (err) => {
      if (err) {
        consoleLog('Error', err);
      } else {
        consoleLog('File "' + file + '" created');
        actuallyPushItemsToDB(items, file);
      }
    });
  }
}

function actuallyPushItemsToDB(items, file) {
  var file = 'db.json';

  fs.readFile(file, 'utf-8', function readFileCallback(err, data){
    if (err) {
        consoleLog(err);
    } else {
      obj = JSON.parse(data);
      consoleLog('Target already contains ' + obj.stores.length + ' items');
      
      items.forEach(function addItemToStoresArray(item) {
        obj.stores.push(generateStoreObject(item));
      });

      json = JSON.stringify(obj);
      fs.writeFile(file, json, 'utf-8', function succeddfullyWritten(err) {
        if (err) {
          consoleLog(err);
        } else {
          consoleLog('Successfully added ' + items.length + ' items');
          consoleLog('Target now contains ' + (items.length + obj.stores.length) + ' items');
        }
      });
    }
  });
}

function generateStoreObject(item) {
  var addressList = item.location.display_address;
  var address = '';

  addressList.forEach(function getAddressLine(addressLine) {
    if (addressLine !== '' && addressLine !== 'Brazil') {
      address += ' ' + addressLine;
    }
  });

  address = address.trim();

  return {
    address: address,
    donation: item.url,
    id: item.id,
    image: item.image_url,
    name: capitalize(item.name),
    status: 1,
  };
}

function capitalize(str, lower = false) {
  return (lower ? str.toLowerCase() : str)
    .replace(/(?:^|\s|["'([{])+\S/g, function(match) {
      if (match.length >= 3) {
        return match.toUpperCase();
      }

      return match;
    });
};
