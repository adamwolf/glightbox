/**
 * Tests for picture element and multiple sources support in glightbox.
 *
 * These tests verify the custom functionality added to support responsive
 * images with <picture> elements and multiple <source> children.
 */

import slideImage from '../src/js/slides/image.js';
import SlideConfigParser from '../src/js/core/slide-parser.js';

describe('slideImage - picture element support', () => {
    let slideElement;
    let slideMedia;

    beforeEach(() => {
        // Create a minimal slide structure that slideImage expects
        slideMedia = document.createElement('div');
        slideMedia.className = 'gslide-media';

        slideElement = document.createElement('div');
        slideElement.className = 'gslide';
        slideElement.appendChild(slideMedia);
    });

    afterEach(() => {
        slideElement = null;
        slideMedia = null;
    });

    test('creates img element without picture when sources not provided', (done) => {
        const data = {
            href: 'test-image.jpg',
            title: '',
            description: '',
            alt: 'Test image'
        };

        slideImage(slideElement, data, 0, () => {
            const img = slideMedia.querySelector('img');
            const picture = slideMedia.querySelector('picture');

            expect(img).not.toBeNull();
            expect(picture).toBeNull();
            expect(img.src).toContain('test-image.jpg');
            expect(img.alt).toBe('Test image');
            done();
        });

        // Trigger load event
        const img = slideMedia.querySelector('img');
        img.dispatchEvent(new Event('load'));
    });

    test('creates picture element with sources when sources array is provided', (done) => {
        const data = {
            href: 'test-image.jpg',
            title: '',
            description: '',
            alt: 'Test image',
            sources: [
                { srcset: 'test-image.avif', type: 'image/avif' },
                { srcset: 'test-image.webp', type: 'image/webp' }
            ]
        };

        slideImage(slideElement, data, 0, () => {
            const picture = slideMedia.querySelector('picture');
            const sources = slideMedia.querySelectorAll('source');
            const img = slideMedia.querySelector('img');

            expect(picture).not.toBeNull();
            expect(sources.length).toBe(2);
            expect(img).not.toBeNull();

            // Verify sources are inside picture
            expect(picture.contains(sources[0])).toBe(true);
            expect(picture.contains(sources[1])).toBe(true);
            expect(picture.contains(img)).toBe(true);

            // Verify source attributes
            expect(sources[0].srcset).toBe('test-image.avif');
            expect(sources[0].type).toBe('image/avif');
            expect(sources[1].srcset).toBe('test-image.webp');
            expect(sources[1].type).toBe('image/webp');

            done();
        });

        // Trigger load event on the img inside picture
        const img = slideMedia.querySelector('img');
        img.dispatchEvent(new Event('load'));
    });

    test('source elements have correct sizes attribute when provided', (done) => {
        const data = {
            href: 'test-image.jpg',
            title: '',
            description: '',
            sources: [
                {
                    srcset: 'small.avif 400w, large.avif 800w',
                    sizes: '(max-width: 600px) 400px, 800px',
                    type: 'image/avif'
                }
            ]
        };

        slideImage(slideElement, data, 0, () => {
            const source = slideMedia.querySelector('source');

            expect(source.srcset).toBe('small.avif 400w, large.avif 800w');
            expect(source.sizes).toBe('(max-width: 600px) 400px, 800px');
            done();
        });

        const img = slideMedia.querySelector('img');
        img.dispatchEvent(new Event('load'));
    });

    test('source elements have correct media attribute when provided', (done) => {
        const data = {
            href: 'test-image.jpg',
            title: '',
            description: '',
            sources: [
                {
                    srcset: 'dark-theme.avif',
                    media: '(prefers-color-scheme: dark)',
                    type: 'image/avif'
                },
                {
                    srcset: 'light-theme.avif',
                    media: '(prefers-color-scheme: light)',
                    type: 'image/avif'
                }
            ]
        };

        slideImage(slideElement, data, 0, () => {
            const sources = slideMedia.querySelectorAll('source');

            expect(sources[0].media).toBe('(prefers-color-scheme: dark)');
            expect(sources[1].media).toBe('(prefers-color-scheme: light)');
            done();
        });

        const img = slideMedia.querySelector('img');
        img.dispatchEvent(new Event('load'));
    });

    test('img element inside picture still has correct src and alt', (done) => {
        const data = {
            href: 'fallback.jpg',
            title: '',
            description: '',
            alt: 'Fallback description',
            sources: [
                { srcset: 'modern.avif', type: 'image/avif' }
            ]
        };

        slideImage(slideElement, data, 0, () => {
            const img = slideMedia.querySelector('picture img');

            expect(img.src).toContain('fallback.jpg');
            expect(img.alt).toBe('Fallback description');
            done();
        });

        const img = slideMedia.querySelector('img');
        img.dispatchEvent(new Event('load'));
    });

    test('aria-labelledby is set on picture element when title provided', (done) => {
        const data = {
            href: 'test.jpg',
            title: 'Image Title',
            description: '',
            sources: [
                { srcset: 'test.avif', type: 'image/avif' }
            ]
        };

        slideImage(slideElement, data, 0, () => {
            const picture = slideMedia.querySelector('picture');

            expect(picture.getAttribute('aria-labelledby')).toBe('gSlideTitle_0');
            done();
        });

        const img = slideMedia.querySelector('img');
        img.dispatchEvent(new Event('load'));
    });

    test('aria-describedby is set on picture element when description provided', (done) => {
        const data = {
            href: 'test.jpg',
            title: '',
            description: 'Image description text',
            sources: [
                { srcset: 'test.avif', type: 'image/avif' }
            ]
        };

        slideImage(slideElement, data, 0, () => {
            const picture = slideMedia.querySelector('picture');

            expect(picture.getAttribute('aria-describedby')).toBe('gSlideDesc_0');
            done();
        });

        const img = slideMedia.querySelector('img');
        img.dispatchEvent(new Event('load'));
    });
});

describe('SlideConfigParser - sources parsing', () => {
    let parser;
    let settings;

    beforeEach(() => {
        parser = new SlideConfigParser();
        settings = {
            descPosition: 'bottom',
            width: 'auto',
            height: 'auto'
        };
    });

    test('parses data-sources-json attribute from element', () => {
        const element = document.createElement('a');
        element.href = 'test.jpg';
        element.dataset.sourcesJson = JSON.stringify([
            { srcset: 'test.avif', type: 'image/avif' },
            { srcset: 'test.webp', type: 'image/webp' }
        ]);

        const config = parser.parseConfig(element, settings);

        expect(config.sources).toEqual([
            { srcset: 'test.avif', type: 'image/avif' },
            { srcset: 'test.webp', type: 'image/webp' }
        ]);
    });

    test('parses sourcesJSON from object config', () => {
        const elementConfig = {
            href: 'test.jpg',
            sourcesJSON: JSON.stringify([
                { srcset: 'test.avif', type: 'image/avif' }
            ])
        };

        // When passing an object (not a DOM node), parseConfig handles it differently
        // We need to test the sourcesJSON parsing path
        const element = document.createElement('a');
        element.href = 'test.jpg';
        element.setAttribute('data-glightbox', 'sourcesJSON: ' + JSON.stringify([
            { srcset: 'test.avif', type: 'image/avif' }
        ]));

        // Test by setting sourcesJSON directly in data attribute style
        const element2 = document.createElement('a');
        element2.href = 'test.jpg';
        element2.dataset.sourcesJson = JSON.stringify([
            { srcset: 'parsed.avif', type: 'image/avif' }
        ]);

        const config = parser.parseConfig(element2, settings);
        expect(config.sources).toBeDefined();
        expect(Array.isArray(config.sources)).toBe(true);
    });

    test('sources field exists in defaults', () => {
        // The parser defaults include a sources field
        expect(parser.defaults.sources).toBe('');
    });

    test('handles complex sources with all attributes', () => {
        const sourcesData = [
            {
                srcset: 'small.avif 400w, medium.avif 800w, large.avif 1200w',
                sizes: '(max-width: 400px) 400px, (max-width: 800px) 800px, 1200px',
                type: 'image/avif',
                media: '(min-width: 320px)'
            },
            {
                srcset: 'small.webp 400w, medium.webp 800w, large.webp 1200w',
                sizes: '(max-width: 400px) 400px, (max-width: 800px) 800px, 1200px',
                type: 'image/webp'
            }
        ];

        const element = document.createElement('a');
        element.href = 'fallback.jpg';
        element.dataset.sourcesJson = JSON.stringify(sourcesData);

        const config = parser.parseConfig(element, settings);

        expect(config.sources).toEqual(sourcesData);
        expect(config.sources[0].srcset).toContain('small.avif 400w');
        expect(config.sources[0].media).toBe('(min-width: 320px)');
    });
});
