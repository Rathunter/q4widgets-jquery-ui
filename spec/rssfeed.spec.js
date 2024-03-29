describe('rssfeed', function () {
    var $rss;

    // data fixtures
    jasmine.getFixtures().fixturesPath = 'base/spec/fixtures';
    var fakeXML = readFixtures('hilton.rss');

    beforeEach(function (done) {
        // return hilton.rss on all ajax requests
        spyOn($, 'get').and.callFake(function (url) {
            return $.Deferred().resolve(fakeXML);
        });
        spyOn($, 'ajax').and.callFake(function (opts) {
            return $.Deferred().resolve(fakeXML);
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
