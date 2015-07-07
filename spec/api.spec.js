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

        spyOn($.q4.api.prototype, '_create').and.callThrough();
        spyOn($.q4.api.prototype, '_init').and.callThrough();

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
            beforeEach(function (done) {
                // spies for callbacks
                this.onTagChange = jasmine.createSpy();
                this.onYearChange = jasmine.createSpy();
                this.beforeRender = jasmine.createSpy();
                this.beforeRenderItems = jasmine.createSpy();

                // initialize widget
                $widget.news({
                    template: template,
                    tagSelect: 'input',
                    yearTrigger: 'ul li',
                    yearSelect: 'select',
                    onTagChange: this.onTagChange,
                    onYearChange: this.onYearChange,
                    beforeRender: this.beforeRender,
                    beforeRenderItems: this.beforeRenderItems,
                    complete: done
                });
            });

            it('should call the api constructors', function () {
                expect($.q4.api.prototype._create).toHaveBeenCalled();
                expect($.q4.api.prototype._init).toHaveBeenCalled();
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
                $('input', $widget).val('test').change();
                expect(this.onTagChange).toHaveBeenCalledWith(jasmine.any(Object), {
                    tags: ['test']
                });
            });

            it('should not call onYearChange or change the year when the active trigger is clicked', function () {
                $('ul li:first', $widget).click();
                expect(this.onYearChange).not.toHaveBeenCalled();
            });

            it('should call onYearChange when a year trigger is clicked', function () {
                $('ul li:eq(1)', $widget).click();
                expect(this.onYearChange).toHaveBeenCalledWith(jasmine.any(Object), {
                    year: 2013
                });
            });

            it('should call onYearChange when a year select is changed', function () {
                $('select', $widget).val('2013').change();
                expect(this.onYearChange).toHaveBeenCalledWith(jasmine.any(Object), {
                    year: 2013
                });
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
