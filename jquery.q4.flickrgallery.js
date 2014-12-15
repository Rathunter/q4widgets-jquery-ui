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
            /* Flickr API key. */
            apiKey: '',
            /* Flickr user ID. */
            userId: '',
            /* List of photo album names. If the list is empty, return all photo albums. */
            albums: [],
            /* Number of photos to return. The maximum is 500. */
            perPage: 500,
            /* A mustache.js template for all photo albums.
             * An album has these tags:
             *   albumID
             *   albumTitle
             *   albumDesc
             *   photoCount
             *   photos: An array of photos in this album.
             *   Each photo has these tags:
             *     photoID
             *     photoTitle
             *     photoDesc
             *     photoIndex
             *     url: An object of URLs for each size, e.g. {{url.Medium}}:
             *       Square:        75 x 75
             *       LargeSquare:  150 x 150
             *       Thumbnail:    100 x 75
             *       Small:        240 x 180
             *       Small320:     320 x 240
             *       Medium:       500 x 375
             *       Medium640:    640 x 480
             *       Medium800:    800 x 600
             *       Large:       1024 x 768
             *       Original:    2400 x 1800
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
            /* A callback function that is called when rendering is completed. */
            complete: function () {}
        },

        sizes: {
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

        albums: [],

        _create: function () {
            this._drawGallery();
        },

        _drawGallery: function () {
            var _ = this,
                o = this.options,
                $e = this.element;

            $.ajax({
                url: 'https://api.flickr.com/services/rest/?method=flickr.photosets.getList',
                data: {
                    api_key: o.apiKey,
                    user_id: o.userId,
                    format: 'json'
                },
                dataType: 'jsonp',
                jsonp: 'jsoncallback',
                success: function (data) {
                    if (data.stat != 'ok') {
                        console.error('Flickr error: ' + data.message);
                        return;
                    }

                    // after all albums have been parsed, render the widget
                    _._parsePhotosets(data).done(function () {
                        $e.append(Mustache.render(o.template, {
                            albums: _.albums
                        }));

                        // fire complete callback
                        _._trigger('complete');
                    });
                }
            });
        },

        _parsePhotosets: function (data) {
            // Create an array of API calls so we can check their status before appending their results to the page.
            var _ = this,
                o = this.options,
                apiCalls = [],
                photosets = [];

            // if no albums specified, use them all
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
                    extras = ['description', 'url_o'];

                // Save the request object returned by this API call.
                apiCalls.push($.ajax({
                    url: 'https://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos',
                    data: {
                        api_key: o.apiKey,
                        photoset_id: photoset.id,
                        per_page: o.perPage,
                        extras: extras.join(),
                        format: 'json',
                    },
                    dataType: 'jsonp',
                    jsonp: 'jsoncallback',
                    success: function (data) {
                        $.each(data.photoset.photo, function (j, photo) {
                            var baseUrl = 'https://farm' + photo.farm + '.static.flickr.com/' + photo.server + '/' + photo.id + '_' + photo.secret;
                            photos.push({
                                photoID: photo.id,
                                photoTitle: photo.title,
                                photoDesc: photo.description._content,
                                photoIndex: j + 1,
                                url: _._generateUrls(baseUrl)
                            });
                        });

                        // add template data to the widget's albums array
                        _.albums[i] = {
                            albumID: photoset.id,
                            albumTitle: photoset.title._content,
                            albumDesc: photoset.description._content,
                            albumIndex: i + 1,
                            photos: photos,
                            photoCount: photos.length
                        };
                    }
                }));
            });

            // return a promise which is resolved after all albums have been parsed
            return $.when.apply(this, apiCalls);
        },

        _generateUrls: function (baseUrl) {
            var urls = {};
            $.each(this.sizes, function (size, ext) {
                urls[size] = baseUrl + ext + '.jpg';
            });
            return urls;
        }
    });
})(jQuery);
