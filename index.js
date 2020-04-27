var fs = require('fs');
var path = require('path');

var PATH_TARGET = 'db.json';
var PATH_SOURCE = 'data';
var totalAmountStores = 0;

function consoleLog(string, withSeparator) {
  if (withSeparator) console.log('----------');
  console.log('>> ' + string);
}

function consoleError(string) {
  consoleLog('Error!');
  console.log(string);
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

function deleteTargetFile() {
  if (fs.existsSync(PATH_TARGET)) {
    try {
      fs.unlinkSync(PATH_TARGET);
      consoleLog('The file "' + PATH_TARGET + '" has been deleted');
    } catch(err) {
      consoleError(err);
    }
  } else {
    consoleLog('Could not find the "' + PATH_TARGET + '" file');
  }
}

readFiles(PATH_SOURCE)
.then(files => {
  consoleLog('Loaded ' + files.length + ' files');
  
  if (!(files.length > 0)) {
    consoleError('Not enough files');
    return;
  }

  deleteTargetFile();

  files.forEach((item) => {
    consoleLog('Now reading the file "' + item.filename + '"', true);
    var content = JSON.parse(item.contents);
    var items = content.businesses;
    pushItemsToDB(items);
  });
})
.catch(error => {
  consoleLog(error);
});

function pushItemsToDB(items) {
  consoleLog('Will push "' + items.length + '" items...');

  if (fs.existsSync(PATH_TARGET)) {
    consoleLog('File "' + PATH_TARGET + '" already exists');
    actuallyPushItemsToDB(items);
  } else {
    consoleLog('Creating new "' + PATH_TARGET + '" file');
    var json = { stores: [] };
    var stringJSON = JSON.stringify(json);

    try {
      fs.writeFileSync(PATH_TARGET, stringJSON);
      consoleLog('File "' + PATH_TARGET + '" created');
      actuallyPushItemsToDB(items);
    } catch(err) {   
      consoleError(err);
    };
  }
}

function actuallyPushItemsToDB(stores) {
  try {
    var data = fs.readFileSync(PATH_TARGET, 'utf-8');

    try {
      var obj = JSON.parse(data);
    } catch(err) {
      consoleError(err);
      consoleError(data);
    }

    if (!(obj && obj.stores)) {
      return;
    }

    consoleLog('Target already contains ' + obj.stores.length + ' stores', true);

    stores.forEach(function addItemToStoresArray(store) {
      obj.stores.push(generateStoreObject(store));
    });

    try {
      var json = JSON.stringify(obj);
    } catch(err) {
      consoleError(err);
    }

    try {
      fs.writeFileSync(PATH_TARGET, json, 'utf-8');
      consoleLog('Successfully added ' + stores.length + ' stores');
      totalAmountStores += stores.length;
      consoleLog('Total amount of stores: ' + totalAmountStores);
    } catch(err) {
      consoleError(err);
    }
  } catch(err) {
    consoleError(err);
  }
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
