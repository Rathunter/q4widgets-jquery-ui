/**
 * @class q4.flickrGallery
 * Example Config:
 *
 *      $("#gallery").flickrGallery({
 *          apiKey: 'abcdef1234567890',
 *          userId: '11111111@N01',
 *          perPage: 100,
 *          thumbSize: 'Thumbnail',
 *          photoSize: 'Large',
 *          albums: ['First Photo Album', 'Second Photo Album']
 *      });
 *
 * @docauthor marcusk@q4websystems.com
 *
 * requires: Mustache.js
 */
(function ($) {
    $.widget('q4.flickrGallery', {
        options: {
            /**
            * @cfg
            * Flickr API key.
            */
            apiKey: '',
            /**
            * @cfg
            * Flickr user ID.
            */
            userId: '',
            /**
            * @cfg
            * List of photo album names. If the list is empty, return all photo albums.
            */
            albums: [],
            /**
            * @cfg
            * Number of photos to return. The maximum is 500.
            */
            perPage: 500,
            /**
            * @cfg
            * The size of image to use for each thumbnail. Sizes are as follows:
            * Square:        75 x 75
            * LargeSquare:  150 x 150
            * Thumbnail:    100 x 75
            * Small:        240 x 180
            * Small320:     320 x 240
            * Medium:       500 x 375
            * Medium640:    640 x 480
            * Medium800:    800 x 600
            * Large:       1024 x 768
            * Original:    2400 x 1800
            */
            thumbSize: 'Square',
            /**
            * @cfg
            * The size of image to use for each photo when clicked.
            * Size values are the same as in the thumbSize option.
            */
            photoSize: 'Medium',
            /**
            * @cfg
            * A mustache.js template for a single photo album.
            * The album template can include these tags: {{albumTitle}}, {{albumDesc}}, {{photoCount}}
            * Use {{#photos}} to loop through each photo.
            * The photo loop can use these tags: {{photoTitle}}, {{photoDesc}}, {{photoIndex}}, {{thumbUrl}}, {{photoUrl}}, {{hiresUrl}}
            */
            template: (
                '{{#albums}}' +
                    '<h3>{{albumTitle}}</h3>' +
                    '<ul class="album">' +
                        '{{#photos}}' +
                        '<li class="col-xs-4 col-sm-3 col-md-2 col-lg-2">' +
                            '<a class="fancybox" rel="fncbx" title="{{photoTitle}}" href="{{photoUrl}}">' +
                                '<img src="{{thumbUrl}}" alt="{{photoTitle}}">' +
                                '<span class="title">{{photoTitle}}</span>' +
                            '</a>' +
                        '</li>' +
                        '{{/photos}}' +
                    '</ul>' +
                '{{/albums}}'
            ),
            /**
            * @cfg
            * A callback function that is called when rendering is completed.
            */
            complete: null
        },

        drawGallery: function () {
            var o = this.options,
                $e = this.element,
                sizes = {
                    Square: "_s",
                    LargeSquare: "_q",
                    Thumbnail: "_t",
                    Small: "_m",
                    Small320: "_n",
                    Medium: "",
                    Medium640: "_z",
                    Medium800: "_c",
                    Large: "_b",
                    Original: "_o"
                },
                getList_url = 'https://api.flickr.com/services/rest/?method=flickr.photosets.getList' +
                    '&api_key=' + o.apiKey +
                    '&user_id=' + o.userId +
                    '&format=json&jsoncallback=?';

            $.getJSON(getList_url, function (data) {
                if (data.stat != 'ok') {
                    console.log('Flickr error: ' + data.message);
                    return;
                }

                // Create an array of API calls so we can check their status before appending their results to the page.
                var apiCalls = [],
                    photosets = [],
                    tplData = {
                        albums: []
                    };

                if (!o.albums.length) photosets = data.photosets.photoset;
                else {
                    // Get each photoset in the order they are specified in the albums option.
                    $.each(o.albums, function(i, albumTitle) {
                        $.each(data.photosets.photoset, function (i, photoset) {
                            if (photoset.title._content == albumTitle) {
                                photosets.push(photoset);
                            }
                        })
                    });
                }

                $.each(photosets, function (i, photoset) {
                    var photos = [],
                        getPhotos_url = 'https://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos' +
                        '&api_key=' + o.apiKey +
                        '&photoset_id=' + photoset.id +
                        '&per_page=' + o.perPage +
                        '&extras=description,url_o&format=json&jsoncallback=?';

                    // Save the request object returned by this API call.
                    apiCalls.push($.getJSON(getPhotos_url, function (data) {
                        $.each(data.photoset.photo, function (i, photo) {
                            var baseUrl = 'https://farm' + photo.farm + '.static.flickr.com/' + photo.server + '/' + photo.id + '_' + photo.secret;
                            photos.push({
                                photoTitle: photo.title,
                                photoDesc: photo.description._content,
                                photoIndex: i + 1,
                                thumbUrl: baseUrl + sizes[o.thumbSize] + '.jpg',
                                photoUrl: baseUrl + sizes[o.photoSize] + '.jpg',
                                hiresUrl: photo.url_o
                            });
                        });

                        tplData.albums[i] = {
                            albumTitle: photoset.title._content,
                            albumDesc: photoset.description._content,
                            photos: photos,
                            photoCount: photos.length
                        };
                    }));
                });

                // When all the API calls have finished, append their results in order.
                $.when.apply(this, apiCalls).done(function () {
                    $e.append(Mustache.render(o.template, tplData));

                    // fire complete callback
                    if (typeof o.complete === 'function') {
                        o.complete();
                    }
                });
            });
        },

        _init: function () {
            this.drawGallery();
        }
    });
})(jQuery);
