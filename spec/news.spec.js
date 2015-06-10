describe('news', function () {
    var $news;

    // dummy functions
    GetViewType = jasmine.createSpy();
    GetViewDate = jasmine.createSpy();
    GetRevisionNumber = jasmine.createSpy();
    GetLanguageId = jasmine.createSpy();
    GetSignature = jasmine.createSpy();

    // data fixtures
    jasmine.getJSONFixtures().fixturesPath = '.';
    var fakePress = getJSONFixture('news.json'),
        fakeYears = {GetPressReleaseYearListResult: [2014, 2013, 2012]};

    beforeEach(function (done) {
        // return fake data on jquery ajax requests
        spyOn($, 'ajax').and.callFake(function (opts) {
            if (opts.url.indexOf('GetPressReleaseYearList') > -1) {
                opts.success(fakeYears);

            } else if (opts.url.indexOf('GetPressReleaseList') > -1) {
                opts.success(fakePress);
            }
        });

        // create widget in sandbox
        $news = setFixtures(sandbox({id: 'news'}));
        $news.news({
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
        expect($news).toContainElement('header');
    });

    it('should have the correct number of articles', function () {
        expect($('article', $news)).toHaveLength(9);
    });
});
