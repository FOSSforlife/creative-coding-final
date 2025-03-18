const albums = require('./albums');

const results = albums.map((album) => ({
  ...album,
  Descriptors: album.Descriptors.split(', '),
}));

function filter(filterObj) {
  const { selectedDescriptors } = filterObj;
  if (!selectedDescriptors) {
    return results;
  }

  return results.filter((album) =>
    album.Descriptors.every((descriptor) =>
      selectedDescriptors.includes(descriptor)
    )
  );
}

const finalResults = filter({ selectedDescriptors: ['fun', 'atmospheric'] });
console.log(`${finalResults.length} items`);
