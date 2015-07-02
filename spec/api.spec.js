describe('api', function () {
    console.log(__dirname);
    // data fixtures
    jasmine.getJSONFixtures().fixturesPath = '';

    // dummy functions
    GetViewType = jasmine.createSpy();
    GetViewDate = jasmine.createSpy();
    GetRevisionNumber = jasmine.createSpy();
    GetLanguageId = jasmine.createSpy();
    GetSignature = jasmine.createSpy();

    var $widget;
    beforeEach(function () {
        spyOn($.q4.api.prototype, '_create');
        // create widget element in sandbox
        $widget = setFixtures(sandbox({id: 'widget'}));
    });

    describe('news', function () {
        var fakePress = getJSONFixture('spec/fixtures/news.json'),
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
            $widget.news({
                template: (
                    '<header></header>' +
                    '{{#items}}' +
                        '<article></article>' +
                    '{{/items}}'
                ),
                // run done function in callback, so tests get executed afterward
                complete: function () {
                    console.log('done!');
                    done();
                }
            });
        });

        it('should call the api constructor', function () {
            expect($.q4.api.prototype._create).toHaveBeenCalled();
        });

        it('should append the template', function () {
            expect($widget).toContainElement('header');
        });

        it('should have the correct number of articles', function () {
            expect($('article', $widget)).toHaveLength(9);
        });
    });
});
