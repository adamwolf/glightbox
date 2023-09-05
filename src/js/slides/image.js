/**
 * Set slide inline content
 * we'll extend this to make http
 * requests using the fetch api
 * but for now we keep it simple
 *
 * @param {node} slide
 * @param {object} data
 * @param {int} index
 * @param {function} callback
 */

import { isNil, isFunction } from '../utils/helpers.js';

export default function slideImage(slide, data, index, callback) {
    const slideMedia = slide.querySelector('.gslide-media');
    let titleID = 'gSlideTitle_' + index;
    let textID = 'gSlideDesc_' + index;

    let mediaElement;  // This could be an img or a picture

    let picture;

    if (data.sources) {
        console.log(`AWW image: ${data.sources}`);

        // If sources are provided, use picture/source/img structure
        picture = document.createElement('picture');

        for (let i = 0; i < data.sources.length; i++) {
            console.log("creating source");

            let sourceData = data.sources[i];

            let source = document.createElement('source');
            if (sourceData.srcset) source.srcset = sourceData.srcset;
            if (sourceData.sizes) source.sizes = sourceData.sizes;
            if (sourceData.media) source.media = sourceData.media;
            if (sourceData.type) source.type = sourceData.type;
            source.loading = "lazy"; // TODO lazyloading doesn't appear to work here

            picture.appendChild(source);
            console.log("foo");
        }
    }

    let img = new Image();
    img.src = data.href;

    if (data.sizes && data.srcset) {
        img.sizes = data.sizes;
        img.srcset = data.srcset;
    }

    img.alt = ''; // https://davidwalsh.name/accessibility-tip-empty-alt-attributes
    if (!isNil(data.alt) && data.alt !== '') {
        img.alt = data.alt;
    }

    if (data.hasOwnProperty('_hasCustomWidth') && data._hasCustomWidth) {
        img.style.width = data.width;
    }
    if (data.hasOwnProperty('_hasCustomHeight') && data._hasCustomHeight) {
        img.style.height = data.height;
    }

    if (picture) {
        picture.appendChild(img);
        mediaElement = picture;
    } else
    {
        mediaElement = img;
    }

    if (picture || img.srcset) {
        img.setAttribute('loading', 'lazy');
    }

    img.addEventListener('load', () => {
        if (isFunction(callback)) {
            callback();
        }
    }, false);

    if (data.title !== '') {
        mediaElement.setAttribute('aria-labelledby', titleID);
    }
    if (data.description !== '') {
        mediaElement.setAttribute('aria-describedby', textID);
    }

    slideMedia.insertBefore(mediaElement, slideMedia.firstChild);
    return;
}
