(function ($) {
    /**
     * A table of different types of financial documents sorted by year.
     * Each year can have links to documents for each quarter.
     * @class q4.financialTable
     * @version 1.1.1
     * @example
     * $("#financials").financialTable({
     *     year: 2014,
     *     reportSubType: ['Annual Report', 'Supplemental Report']
     * });
     * @author marcusk@q4websystems.com
     * @requires Mustache.js
     */
    $.widget('q4.financialTable', /** @lends q4.financialTable */ {
        options: {
            /**
             * The number of year columns to display.
             * Set to zero to show all columns (default).
             * @type {number}
             */
            columns: 0,
            /**
             * The earliest year to display; previous years will be ignored.
             * Set to zero to show all years (default).
             * @type {(number|string)}
             */
            firstYear: 0,
            /**
             * An array of document categories that will appear as rows
             * in the table.
             * @type {Array<Object>}
             * @prop {string}        title      The title to display for that row.
             * @prop {Array<string>} reportType A filter list of financial report subtypes (optional).
             * @prop {Array<string>} category   A filter list of document categories (optional).
             * @prop {Array<string>} tags       A filter list of tags (optional).
             * @prop {string}        text       A template to use for the link (default blank).
             *   See `template` documentation for available tags.
             * @example
             * [
             *     {
             *          title: 'Quarterly Reports',
             *          reportType: ['First Quarter', 'Second Quarter', 'Third Quarter', 'Fourth Quarter'],
             *          category: ['Financials'],
             *          text: '{{shortType}}'
             *     },
             *     {
             *          title: 'Annual Reports',
             *          reportType: ['Annual Report'],
             *          text: 'Annual ({{fileType}})'
             *     }
             * ]
             */
            categories: [],
            /**
             * A map of short names for each report subtype.
             * @type {Object}
             */
            shortTypes: {
                'Annual Report': 'Annual',
                'Supplemental Report': 'Supplemental',
                'First Quarter': 'Q1',
                'Second Quarter': 'Q2',
                'Third Quarter': 'Q3',
                'Fourth Quarter': 'Q4'
            },
            /**
             * A mustache.js template for the financial report list.
             * Use {{#years}} to loop through document years.
             * Use {{#categories}} to loop through document categories.
             * Categories have these tags: {{catTitle}}, {{catClass}}
             * Within a category, use {{#catYears}} to loop through years.
             * Within a year, use {{#docs}} to loop through documents.
             * Documents can have these tags:
             *
             * - `{{text}}`      The value of the category's "text" option
             *     (which might contain any of the below tags).
             * - `{{fileType}}`  The document file type.
             * - `{{shortType}}` The short name of the report subtype,
             *     as defined in options.shortTypes (e.g. Q1, Q2, Annual).
             * - `{{size}}`      The size of the document file.
             * - `{{title}}`     The title of the document.
             * - `{{url}}`       The URL of the document file.
             * - `{{year}}`      The fiscal year of the report.
             * @type {string}
             * @example
             * '<ul class="ftHeader">' +
             *     '<li>Document</li>' +
             *     '{{#years}}<li>{{year}}</li>{{/years}}' +
             * '</ul>' +
             * '{{#categories}}' +
             * '<ul class="ftRow {{catClass}}">' +
             *     '<li>{{catTitle}}</li>' +
             *     '{{#catYears}}' +
             *     '<li>' +
             *         '{{#docs}}<a href="{{url}}" class="docLink {{fileType}}">{{{text}}}</a>{{/docs}}' +
             *     '</li>' +
             *     '{{/catYears}}' +
             * '</ul>' +
             * '{{/categories}}'
             */
            template: '',
            /**
            * A callback fired when rendering is completed.
            * @type {function}
            * @param {Event} [event] The event object.
            */
            complete: function (e) {}
        },

        _fetchFinancials: function() {
            var _ = this,
                o = this.options,
                params = {
                    serviceDto: {
                        ViewType: GetViewType(),
                        ViewDate: GetViewDate(),
                        RevisionNumber: GetRevisionNumber(),
                        LanguageId: GetLanguageId(),
                        Signature: GetSignature()
                    },
                    year: -1,
                    reportSubTypeList: o.reportSubType
                };

            $.ajax({
                type: 'POST',
                url: '/Services/FinancialReportService.svc/GetFinancialReportList',
                data: JSON.stringify(params),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                success: function(data) {
                    _._drawFinancialTable(data);
                }
            });
        },

        _drawFinancialTable: function(data) {
            var o = this.options,
                years = [],
                documents = {},
                tplData = {
                    years: [],
                    categories: []
                };

            // Create a list of years.
            $.each(data.GetFinancialReportListResult, function(i, report) {
                if ($.inArray(report.ReportYear, years) == -1 && (o.firstYear == 0 || report.ReportYear >= o.firstYear)) {
                    years.push(report.ReportYear);
                }
            });
            // Sort in descending order.
            years.sort(function(a, b) { return b - a });
            // Clip years to the number of columns specified.
            if (o.columns > 0) {
                years = years.slice(0, o.columns);
            }

            // Create a document object indexed by category and year.
            $.each(o.categories, function(i, cat) {
                // Add this category to the document object.
                documents[cat.title] = {};
                $.each(years, function(i, year) {
                    documents[cat.title][year] = [];
                });

                // Also, normalize category filters to arrays.
                if (!$.isArray(cat.category)) cat.category = cat.category ? [cat.category] : [];
                if (!$.isArray(cat.reportType)) cat.reportType = cat.reportType ? [cat.reportType] : [];
                if (!$.isArray(cat.tags)) cat.tags = cat.tags ? [cat.tags] : [];
            });

            // Loop through all documents for the selected years, and add them to the data object.
            $.each(data.GetFinancialReportListResult, function(i, report) {
                if ($.inArray(report.ReportYear, years) == -1) return true;

                $.each(report.Documents, function(i, doc) {
                    $.each(o.categories, function(i, cat) {
                        // Skip document if category/tag filters don't match.
                        if (cat.category.length && $.inArray(doc.DocumentCategory, cat.category) == -1) return true;
                        if (cat.reportType.length && $.inArray(report.ReportSubType, cat.reportType) == -1) return true;
                        if (cat.tags.length && !$(doc.TagsList).filter(cat.tags).length) return true;

                        // Format data and render text template.
                        var docData = {
                            fileType: doc.DocumentFileType,
                            shortType: o.shortTypes[report.ReportSubType],
                            size: doc.DocumentFileSize,
                            title: doc.DocumentTitle,
                            url: doc.DocumentPath,
                            year: report.ReportYear,
                            category: doc.DocumentCategory
                        };
                        docData.text = 'text' in cat ? Mustache.render(cat.text, docData) : '';

                        // Add the document to the data object in the correct category and year.
                        documents[cat.title][report.ReportYear].push(docData);
                    });
                });
            });

            // Restructure the data for Mustache.
            $.each(years, function(i, year) {
                tplData.years.push({year: year});
            });

            $.each(o.categories, function(i, cat) {
                var tplCat = {
                    catTitle: cat.title,
                    catClass: 'cssClass' in cat ? cat.cssClass : '',
                    catYears: []
                };
                $.each(years, function(i, year) {
                    if (year in documents[cat.title]) {
                        // Push the documents in reverse (i.e. ascending) order.
                        documents[cat.title][year].reverse();
                        tplCat.catYears.push({'docs': documents[cat.title][year]});
                    } else {
                        tplCat.catYears.push({'docs': []});
                    }
                });
                tplData.categories.push(tplCat);
            });

            // Render the template and append it to the element.
            this.element.append(Mustache.render(o.template, tplData));

            // Fire the complete callback.
            this._trigger('complete');
        },

        _create: function() {
            $.ajaxSetup({cache: true});

            this._fetchFinancials();
        }
    });
})(jQuery);
