# q4.flickrGallery

### Fetches and displays photo albums from a user on Flickr.

*Source file: `jquery.q4.flickrgallery.js`, line 2*  
*Author: marcusk@q4websystems.com*  
*Requires:*
- Mustache.js

Example:
```
$("#gallery").flickrGallery({
    apiKey: 'abcdef1234567890',
    userId: '11111111@N01',
    perPage: 100,
    albums: ['First Photo Album', 'Second Photo Album']
});
```

## Options
- **apiKey** - *string*  
A Flickr API key.  
*Example:*
```
$("#gallery").flickrGallery({
    apiKey: 'abcdef1234567890',
    userId: '11111111@N01',
    perPage: 100,
    albums: ['First Photo Album', 'Second Photo Album']
});
```

- **userId** - *string*  
A Flickr user ID.  
*Example:*
```
$("#gallery").flickrGallery({
    apiKey: 'abcdef1234567890',
    userId: '11111111@N01',
    perPage: 100,
    albums: ['First Photo Album', 'Second Photo Album']
});
```

- **albums** - *Array&lt;string&gt;*  
An array of photo album names to fetch.
If the list is empty (default), fetch all photo albums.  
*Example:*
```
$("#gallery").flickrGallery({
    apiKey: 'abcdef1234567890',
    userId: '11111111@N01',
    perPage: 100,
    albums: ['First Photo Album', 'Second Photo Album']
});
```

- **perPage** - *number*  
The maximum number of photos to fetch from each album.
This can be up to 500.  
*Default:* `500`  
*Example:*
```
$("#gallery").flickrGallery({
    apiKey: 'abcdef1234567890',
    userId: '11111111@N01',
    perPage: 100,
    albums: ['First Photo Album', 'Second Photo Album']
});
```

- **complete** - *function*  
A callback fired when rendering is completed.  
*Parameters:*
    - **event** - *Event*  
    The event object.
*Example:*
```
$("#gallery").flickrGallery({
    apiKey: 'abcdef1234567890',
    userId: '11111111@N01',
    perPage: 100,
    albums: ['First Photo Album', 'Second Photo Album']
});
```


