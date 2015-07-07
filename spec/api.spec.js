describe('api', function () {
    var $widget;

    // data fixtures
    jasmine.getJSONFixtures().fixturesPath = 'base/spec/fixtures';
    var fakePress = getJSONFixture('news.json'),
        fakeYears = {GetPressReleaseYearListResult: [2014, 2013, 2012]};

    beforeEach(function () {
        // create widget element in sandbox
        $widget = setFixtures(sandbox({id: 'widget'}));

        // dummy functions
        GetViewType = jasmine.createSpy();
        GetViewDate = jasmine.createSpy();
        GetRevisionNumber = jasmine.createSpy();
        GetLanguageId = jasmine.createSpy();
        GetSignature = jasmine.createSpy();

        spyOn($.q4.api.prototype, '_create');

        // return fake data on jquery ajax requests
        spyOn($, 'ajax').and.callFake(function (opts) {
            var result;
            if (opts.url.indexOf('GetPressReleaseYearList') > -1) result = fakeYears;
            else if (opts.url.indexOf('GetPressReleaseList') > -1) result = fakePress;

            return $.Deferred().resolve(result);
        });
    });

    describe('news', function () {
        var template = (
            '<header></header>' +
            '<ul>' +
                '{{#years}}<li data-val="{{value}}">{{year}}</li>{{/years}}' +
            '</ul>' +
            '<select>' +
                '{{#years}}<option value="{{value}}">{{year}}</option>{{/years}}' +
            '</select>' +
            '<input type="text" />' +
            '{{#items}}' +
                '<article></article>' +
            '{{/items}}'
        );

        describe('basic options', function () {
            var beforeRender = jasmine.createSpy(),
                onTagChange = jasmine.createSpy();

            beforeEach(function (done) {
                $widget.news({
                    template: template,
                    tagSelect: 'input',
                    onTagChange: onTagChange,
                    complete: done
                });
            });

            it('should call the api constructor', function () {
                expect($.q4.api.prototype._create).toHaveBeenCalled();
            });

            it('should append the template', function () {
                expect($widget).toContainElement('header');
            });

            it('should have the correct number of years', function () {
                expect($('option', $widget)).toHaveLength(3);
                expect($('ul li', $widget)).toHaveLength(3);
            });

            it('should have the correct number of articles', function () {
                expect($('article', $widget)).toHaveLength(9);
            });

            it('should call onTagChange when a tag input is changed', function () {
                $('input', $widget).trigger('change');
                expect(onTagChange).toHaveBeenCalled();
            });
        });

        describe('alternate options', function () {
            beforeEach(function (done) {
                $widget.news({
                    template: template,
                    showAllYears: true,
                    startYear: 2013,
                    yearSelect: 'select',
                    yearTrigger: 'ul li',
                    complete: done
                });
            });

            it('should show an All Years option', function () {
                expect($('option', $widget)).toHaveLength(4);
                expect($('option:first', $widget).val()).toEqual('-1');
                expect($('option:first', $widget).text()).toEqual('All');
                expect($('ul li', $widget)).toHaveLength(4);
                expect($('ul li:first', $widget).data('val')).toEqual(-1);
                expect($('ul li:first', $widget).text()).toEqual('All');
            });

            it('should start at year 2013', function () {
                expect($('select', $widget).val()).toEqual('2013');
                expect($('ul li[data-val=2013]', $widget)).toHaveClass('active');
            });
        });
    });
});
