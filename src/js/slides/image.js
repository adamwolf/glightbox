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

    let mediaElement; // This could be an img or a picture element

    let img = new Image();
    const titleID = 'gSlideTitle_' + index;
    const textID = 'gSlideDesc_' + index;

    // prettier-ignore
    img.addEventListener('load', () => {
        if (isFunction(callback)) {
            callback();
        }
    }, false);

    img.src = data.href;
    if (data.sizes != '' && data.srcset != '') {
        img.sizes = data.sizes;
        img.srcset = data.srcset;
    }
    img.alt = ''; // https://davidwalsh.name/accessibility-tip-empty-alt-attributes
    if (!isNil(data.alt) && data.alt !== '') {
        img.alt = data.alt;
    }

    // Apply custom dimensions if specified
    if (data.hasOwnProperty('_hasCustomWidth') && data._hasCustomWidth) {
        img.style.width = data.width;
    }
    if (data.hasOwnProperty('_hasCustomHeight') && data._hasCustomHeight) {
        img.style.height = data.height;
    }

    // Check if we need to use the picture element with multiple sources
    if (data.sources && Array.isArray(data.sources) && data.sources.length > 0) {
        // Create picture element and add sources
        const picture = document.createElement('picture');

        // Add all source elements
        for (let i = 0; i < data.sources.length; i++) {
            const sourceData = data.sources[i];
            const source = document.createElement('source');

            if (sourceData.srcset) {
                source.srcset = sourceData.srcset;
            }
            if (sourceData.sizes) {
                source.sizes = sourceData.sizes;
            }
            if (sourceData.media) {
                source.media = sourceData.media;
            }
            if (sourceData.type) {
                source.type = sourceData.type;
            }

            picture.appendChild(source);
        }

        // Add the img element last
        picture.appendChild(img);
        mediaElement = picture;
    } else {
        // Just use the img element
        mediaElement = img;
    }

    // Set ARIA attributes for accessibility
    if (data.title !== '') {
        mediaElement.setAttribute('aria-labelledby', titleID);
    }
    if (data.description !== '') {
        // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques/Using_the_aria-describedby_attribute#Example_2_A_Close_Button
        mediaElement.setAttribute('aria-describedby', textID);
    }

    slideMedia.insertBefore(mediaElement, slideMedia.firstChild);
    return;
}
