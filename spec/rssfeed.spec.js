describe('rssfeed', function () {
    var $rss;

    jasmine.getFixtures().fixturesPath = '.';
    var fakeXML = readFixtures('hilton.rss');

    beforeEach(function (done) {
        // return hilton.rss on all $.get requests
        spyOn($, 'get').and.callFake(function(url, callback) {
            callback(fakeXML);
        });

        // create widget in sandbox
        $rss = setFixtures(sandbox({id: 'rss'}));
        $rss.rssfeed({
            template: (
                '<header></header>' +
                '{{#items}}' +
                    '<article></article>' +
                '{{/items}}'
            ),
            // run done function in callback, so tests get executed afterward
            complete: done
        });
    });

    it('should append the template', function () {
        expect($rss).toContainElement('header');
    });

    it('should have the correct number of articles', function () {
        expect($('article', $rss)).toHaveLength(3);
    });
});
