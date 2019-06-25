---
title: Exploring the Discrete Cosine Transform
date: 2015-04-28
tags:
  - js
  - math
---
The <abbr title="Discrete Cosine Transform">DCT</abbr> is used extensively in lossy audio and image compression. It can be found in MP3 audio compression, JPEG image compression, and MPEG-1/2 video compression. Let's take a closer look the fundamentals of how a DCT is practically used.

<!-- more -->



## TL;DR
A [DCT](http://en.wikipedia.org/wiki/Discrete_cosine_transform) expresses a finite sequence of data points in terms of a sum of cosine functions oscillating at different frequencies.

For JPEG and MPEG video, here is the formal definition of an 8&times;8 DCT:

[[figure|A 8&times;8 DCT-II]]
| $$
| G_{u,v}= \frac{1}{4} \alpha(u) \alpha(v) \sum_{x=0}^{7} \sum_{y=0}^{7} g_{x,y} \cos \left [ \frac{(2x+1)u\pi}{16} \right ] \cos \left [ \frac{(2y+1)v\pi}{16} \right ]
| $$

Where:

[[figure]]
| $$
| \alpha(u) = \begin{cases} \frac{1}{\sqrt{2}}, & \text{ if } u=0\\ 1, & \text{ otherwise } \end{cases}
| $$

Implemented in JavaScript as:

[[figure|A na&iuml;ve DCT implementation in JavaScript]]
| ```js
| const dct = function(input) {
|   let output = [], v, u, x, y, sum, val, au, av;
|   for (v=0; v<8; v++) {
|     for(u=0; u<8; u++) {
|       sum = 0;
|       for (y=0; y<8; y++) {
|         for(x=0; x <8; x++) {
|           val = input[y*8+x];
|           val *= Math.cos(((2*x+1) * u * Math.PI)/16);
|           val *= Math.cos(((2*y+1) * v * Math.PI)/16);
|           sum += val;
|         }
|       }
|       au = u === 0 ? 1/Math.SQRT2 : 1;
|       av = v === 0 ? 1/Math.SQRT2 : 1;
|       output[v*8+u] = 1/4 * au * av * sum;
|     }
|   }
|   return output;
| }
| ```

And the corresponding *inverse* DCT:

[[figure|The DCT-III, also known as the inverse DCT]]
| $$
| f_{x,y} = \frac{1}{4} \sum_{u=0}^{7} \sum_{u=0}^{7} \alpha(u) \alpha(v) F_{u,v} \cos \left [ \frac{(2x+1)u\pi}{16} \right ] \cos \left [ \frac{(2y+1)v\pi}{16} \right ]
| $$

Where:

[[figure]]
| $$
| \alpha(u) = \begin{cases} \frac{1}{\sqrt{2}}, & \text{ if } u=0\\ 1, & \text{ otherwise } \end{cases}
| $$

Also implemented in JavaScript as:

[[figure|A na&iuml;ve iDCT implementation in JavaScript]]
| ```js
| const idct = function(input) {
|   let output = [], v, u, x, y, sum, val, au, av;
|   for (y=0; y<8; y++) {
|     for(x=0; x<8; x++) {
|       sum = 0;
|       for (v=0; v<8; v++) {
|         for(u=0; u<8; u++) {
|           au = u === 0 ? 1/Math.SQRT2 : 1;
|           av = v === 0 ? 1/Math.SQRT2 : 1;
|           val = block[v*8+u];
|           val *= au;
|           val *= av;
|           val *= Math.cos(((2*x+1) * u * Math.PI)/16);
|           val *= Math.cos(((2*y+1) * v * Math.PI)/16);
|           sum += val;
|         }
|       }
|       output[y*8+x] = 1/4 * sum;
|     }
|   }
|   return output;
| }
| ```

These JavaScript implementations are na&iuml;ve implementations, i.e. that are quite computationally expensive and unoptimized. They *are*, however, relatively easy to reason about.

For reference, there are also several high performance variations and approximations, that reduce the number of mathematical operations required, at the cost of readability. For example:

* The LLM DCT: [
Practical fast 1-D DCT algorithms with 11 multiplications](http://ieeexplore.ieee.org/xpl/login.jsp?tp=&arnumber=266596)
* The AAN DCT: [A Fast DCT-SQ Scheme for Images](http://search.ieice.org/bin/summary.php?id=e71-e_11_1095)

## So, what does it do?

I'm going to start by looking at a simpler one-dimensional example.

We will begin with a signal, a linear ramp, like this:

[[figure|The input signal]]
| <aside><table><thead><th></th><th>Value</th></thead><tbody><tr><th>0</th><td>8.0</td></tr><tr><th>1</th><td>16.0</td></tr><tr><th>2</th><td>24.0</td></tr><tr><th>3</th><td>32.0</td></tr><tr><th>4</th><td>40.0</td></tr><tr><th>5</th><td>48.0</td></tr><tr><th>6</th><td>56.0</td></tr><tr><th>7</th><td>64.0</td></tr></tbody></table></aside>
| <svg viewBox="0 0 600 300"><g transform="translate(50,30)"><g class="x axis" transform="translate(0,240)"><path class="domain" d="M0,6V0H530V6"></path></g><g class="y axis"><g class="tick" transform="translate(0,220)" style="opacity: 1;"><line x2="-6" y2="0"></line><text dy=".32em" x="-9" y="0" style="text-anchor: end;">10</text></g><g class="tick" transform="translate(0,180)" style="opacity: 1;"><line x2="-6" y2="0"></line><text dy=".32em" x="-9" y="0" style="text-anchor: end;">20</text></g><g class="tick" transform="translate(0,139.99999999999997)" style="opacity: 1;"><line x2="-6" y2="0"></line><text dy=".32em" x="-9" y="0" style="text-anchor: end;">30</text></g><g class="tick" transform="translate(0,99.99999999999999)" style="opacity: 1;"><line x2="-6" y2="0"></line><text dy=".32em" x="-9" y="0" style="text-anchor: end;">40</text></g><g class="tick" transform="translate(0,60)" style="opacity: 1;"><line x2="-6" y2="0"></line><text dy=".32em" x="-9" y="0" style="text-anchor: end;">50</text></g><g class="tick" transform="translate(0,20.000000000000007)" style="opacity: 1;"><line x2="-6" y2="0"></line><text dy=".32em" x="-9" y="0" style="text-anchor: end;">60</text></g><path class="domain" d="M-6,0H0V240H-6"></path></g><g class="signal"><line stroke="#1f77b4" x1="33.125" y1="228" x2="33.125" y2="240" style="stroke-width: 2;"></line><path transform="translate(33.125, 228)" fill="#1f77b4" d="M-5.366563145999495,-1.7888543819998317H-1.7888543819998317V-5.366563145999495H1.7888543819998317V-1.7888543819998317H5.366563145999495V1.7888543819998317H1.7888543819998317V5.366563145999495H-1.7888543819998317V1.7888543819998317H-5.366563145999495Z"></path></g><g class="signal"><line stroke="#1f77b4" x1="99.375" y1="196" x2="99.375" y2="240" style="stroke-width: 2;"></line><path transform="translate(99.375, 196)" fill="#1f77b4" d="M-5.366563145999495,-1.7888543819998317H-1.7888543819998317V-5.366563145999495H1.7888543819998317V-1.7888543819998317H5.366563145999495V1.7888543819998317H1.7888543819998317V5.366563145999495H-1.7888543819998317V1.7888543819998317H-5.366563145999495Z"></path></g><g class="signal"><line stroke="#1f77b4" x1="165.625" y1="164" x2="165.625" y2="240" style="stroke-width: 2;"></line><path transform="translate(165.625, 164)" fill="#1f77b4" d="M-5.366563145999495,-1.7888543819998317H-1.7888543819998317V-5.366563145999495H1.7888543819998317V-1.7888543819998317H5.366563145999495V1.7888543819998317H1.7888543819998317V5.366563145999495H-1.7888543819998317V1.7888543819998317H-5.366563145999495Z"></path></g><g class="signal"><line stroke="#1f77b4" x1="231.875" y1="132" x2="231.875" y2="240" style="stroke-width: 2;"></line><path transform="translate(231.875, 132)" fill="#1f77b4" d="M-5.366563145999495,-1.7888543819998317H-1.7888543819998317V-5.366563145999495H1.7888543819998317V-1.7888543819998317H5.366563145999495V1.7888543819998317H1.7888543819998317V5.366563145999495H-1.7888543819998317V1.7888543819998317H-5.366563145999495Z"></path></g><g class="signal"><line stroke="#1f77b4" x1="298.125" y1="99.99999999999999" x2="298.125" y2="240" style="stroke-width: 2;"></line><path transform="translate(298.125, 99.99999999999999)" fill="#1f77b4" d="M-5.366563145999495,-1.7888543819998317H-1.7888543819998317V-5.366563145999495H1.7888543819998317V-1.7888543819998317H5.366563145999495V1.7888543819998317H1.7888543819998317V5.366563145999495H-1.7888543819998317V1.7888543819998317H-5.366563145999495Z"></path></g><g class="signal"><line stroke="#1f77b4" x1="364.375" y1="68" x2="364.375" y2="240" style="stroke-width: 2;"></line><path transform="translate(364.375, 68)" fill="#1f77b4" d="M-5.366563145999495,-1.7888543819998317H-1.7888543819998317V-5.366563145999495H1.7888543819998317V-1.7888543819998317H5.366563145999495V1.7888543819998317H1.7888543819998317V5.366563145999495H-1.7888543819998317V1.7888543819998317H-5.366563145999495Z"></path></g><g class="signal"><line stroke="#1f77b4" x1="430.625" y1="36.00000000000001" x2="430.625" y2="240" style="stroke-width: 2;"></line><path transform="translate(430.625, 36.00000000000001)" fill="#1f77b4" d="M-5.366563145999495,-1.7888543819998317H-1.7888543819998317V-5.366563145999495H1.7888543819998317V-1.7888543819998317H5.366563145999495V1.7888543819998317H1.7888543819998317V5.366563145999495H-1.7888543819998317V1.7888543819998317H-5.366563145999495Z"></path></g><g class="signal"><line stroke="#1f77b4" x1="496.875" y1="4.000000000000012" x2="496.875" y2="240" style="stroke-width: 2;"></line><path transform="translate(496.875, 4.000000000000012)" fill="#1f77b4" d="M-5.366563145999495,-1.7888543819998317H-1.7888543819998317V-5.366563145999495H1.7888543819998317V-1.7888543819998317H5.366563145999495V1.7888543819998317H1.7888543819998317V5.366563145999495H-1.7888543819998317V1.7888543819998317H-5.366563145999495Z"></path></g></g></svg>

The input signal has been sampled 8 times, each sample is *independent* from it's neighboring samples; i.e. it represents the value of the signal at a specific point in space or time. A DCT transforms these discrete data points into a sum of cosine functions, each oscillating at a *different frequencies* and at *different magnitudes*.

Specifically, the DCT will transform this of *8 samples* into *8 coefficients*. Each coefficient will multiply a specific cosine frequency -- altering that magnitude of that function and its corresponding impact on the reconstructed signal.

***

Let's look at the formal definition of the forward and inverse one-dimensional DCT that we will be using.

[[figure|A 1-D DCT and iDCT]]
| $$
| G_{k}= \alpha(k) \sqrt{\frac{2}{N}} \sum_{n=0}^{N-1} g_{n} \cos \left [ \frac{\pi}{N} \left (n + \frac{1}{2} \right ) k \right ]
| $$
|
| $$
| g_{n} = \sqrt{\frac{2}{N}} \sum_{k=0}^{N-1} \alpha(k) G_{k} \cos \left [ \frac{\pi}{N} \left (n + \frac{1}{2} \right ) k \right ]
| $$
|
| Where:
|
| $$
| \alpha(x) = \begin{cases} \frac{1}{\sqrt {2} }, & \text{ if } x=0\\ 1, & \text{ otherwise } \end{cases} \\
| g \text{ is the input } \\
| G \text{ is the DCT output } \\
| N \text{ is the number of samples being transformed}
| $$

First, we can focus just on the forward DCT transformation. We can translate the forward equation into the following JavaScript:

[[figure|A na&iuml;ve implementation of a forward 1D DCT.]]
| ```js
| const dct1d = function(signal) {
|   let N = signal.length,
|       output = [],
|       sum, k, n, s;
|
|   for(k=0; k<N; k++) {
|     sum = 0;
|     for(n=0; n<N; n++) {
|       sum += signal[n] * Math.cos(Math.PI * (n + 0.5) * k / N);
|     }
|     s = k===0 ? 1/Math.sqrt(2) : 1;
|     output[k] = s * Math.sqrt(2/N) * sum;
|   }
|   return output;
| };
| ```

This function will take an array of samples and return an array of *equal length* DCT coefficients. Now, we can use this function to transform our input signal. Something like:

```js
var coefficients = dct1d([8,16,24,32,40,48,56,64]);
```

The resulting array will be 8 elements long and will look like this:

[[figure|The computed DCT coefficients]]
| <aside><table><thead><th></th><th>Value</th></thead><tbody><tr><th>0</th><td>101.8</td></tr><tr><th>1</th><td>-51.5</td></tr><tr><th>2</th><td>-0.0</td></tr><tr><th>3</th><td>-5.4</td></tr><tr><th>4</th><td>0.0</td></tr><tr><th>5</th><td>-1.6</td></tr><tr><th>6</th><td>-0.0</td></tr><tr><th>7</th><td>-0.4</td></tr></tbody></table></aside>
| <svg viewBox="0 0 600 300"><g transform="translate(50,30)"><g class="x axis" transform="translate(0,160.00000000000003)"><path class="domain" d="M0,6V0H530V6"></path></g><g class="y axis"><g class="tick" transform="translate(0,226.66666666666666)" style="opacity: 1;"><line x2="-6" y2="0"></line><text dy=".32em" x="-9" y="0" style="text-anchor: end;">-50</text></g><g class="tick" transform="translate(0,160.00000000000003)" style="opacity: 1;"><line x2="-6" y2="0"></line><text dy=".32em" x="-9" y="0" style="text-anchor: end;">0</text></g><g class="tick" transform="translate(0,93.33333333333331)" style="opacity: 1;"><line x2="-6" y2="0"></line><text dy=".32em" x="-9" y="0" style="text-anchor: end;">50</text></g><g class="tick" transform="translate(0,26.66666666666668)" style="opacity: 1;"><line x2="-6" y2="0"></line><text dy=".32em" x="-9" y="0" style="text-anchor: end;">100</text></g><path class="domain" d="M-6,0H0V240H-6"></path></g><g class="signal"><line stroke="#ff7f0e" x1="33.125" y1="24.235498012182866" x2="33.125" y2="160.00000000000003" style="stroke-width: 2;"></line><path transform="translate(33.125, 24.235498012182866)" fill="#ff7f0e" d="M0,-7.444838872816797L4.298279727294168,0 0,7.444838872816797 -4.298279727294168,0Z"></path></g><g class="signal"><line stroke="#ff7f0e" x1="99.375" y1="228.71811224218814" x2="99.375" y2="160.00000000000003" style="stroke-width: 2;"></line><path transform="translate(99.375, 228.71811224218814)" fill="#ff7f0e" d="M0,-7.444838872816797L4.298279727294168,0 0,7.444838872816797 -4.298279727294168,0Z"></path></g><g class="signal"><line stroke="#ff7f0e" x1="165.625" y1="160.00000000000003" x2="165.625" y2="160.00000000000003" style="stroke-width: 2;"></line><path transform="translate(165.625, 160.00000000000003)" fill="#ff7f0e" d="M0,-7.444838872816797L4.298279727294168,0 0,7.444838872816797 -4.298279727294168,0Z"></path></g><g class="signal"><line stroke="#ff7f0e" x1="231.875" y1="167.18351787630866" x2="231.875" y2="160.00000000000003" style="stroke-width: 2;"></line><path transform="translate(231.875, 167.18351787630866)" fill="#ff7f0e" d="M0,-7.444838872816797L4.298279727294168,0 0,7.444838872816797 -4.298279727294168,0Z"></path></g><g class="signal"><line stroke="#ff7f0e" x1="298.125" y1="160.00000000000003" x2="298.125" y2="160.00000000000003" style="stroke-width: 2;"></line><path transform="translate(298.125, 160.00000000000003)" fill="#ff7f0e" d="M0,-7.444838872816797L4.298279727294168,0 0,7.444838872816797 -4.298279727294168,0Z"></path></g><g class="signal"><line stroke="#ff7f0e" x1="364.375" y1="162.14296430651729" x2="364.375" y2="160.00000000000003" style="stroke-width: 2;"></line><path transform="translate(364.375, 162.14296430651729)" fill="#ff7f0e" d="M0,-7.444838872816797L4.298279727294168,0 0,7.444838872816797 -4.298279727294168,0Z"></path></g><g class="signal"><line stroke="#ff7f0e" x1="430.625" y1="160.00000000000017" x2="430.625" y2="160.00000000000003" style="stroke-width: 2;"></line><path transform="translate(430.625, 160.00000000000017)" fill="#ff7f0e" d="M0,-7.444838872816797L4.298279727294168,0 0,7.444838872816797 -4.298279727294168,0Z"></path></g><g class="signal"><line stroke="#ff7f0e" x1="496.875" y1="160.54082477610265" x2="496.875" y2="160.00000000000003" style="stroke-width: 2;"></line><path transform="translate(496.875, 160.54082477610265)" fill="#ff7f0e" d="M0,-7.444838872816797L4.298279727294168,0 0,7.444838872816797 -4.298279727294168,0Z"></path></g></g></svg>

## Reconstructing the signal

Now that we have our set of coefficients, how do we transform it back into the original signal? For that, we use the *inverse* DCT.

Again, we can express this in JavaScript as:

[[figure|A na&iuml;ve implementation of a inverse 1D DCT.]]
| ```js
|   const idct1d = function(dct) {
|     let N = dct.length,
|         signal = [],
|         sum, k, n, s;
|
|     for(n=0; n<N; n++) {
|       sum = 0;
|       for(k=0; k<N; k++) {
|         s = k===0 ? Math.sqrt(0.5) : 1;
|         sum += s * dct[k] * Math.cos(Math.PI * (n+0.5) * k / N);
|       }
|       signal[n] = Math.sqrt(2/N) * sum;
|     }
|     return signal;
|   };
| ```

Let use it to reconstruct our signal:

```js
const reconstructedSignal = idct1d(coefficients);
```

Again, this function returns the same number of samples as our coefficients. And aside from some small floating-point rounding errors, the reconstructed signal is identical to the original signal.

[[figure|The reconstructed signal]]
| <aside><table><thead><th></th><th>Value</th></thead><tbody><tr><th>0</th><td>8.0</td></tr><tr><th>1</th><td>16.0</td></tr><tr><th>2</th><td>24.0</td></tr><tr><th>3</th><td>32.0</td></tr><tr><th>4</th><td>40.0</td></tr><tr><th>5</th><td>48.0</td></tr><tr><th>6</th><td>56.0</td></tr><tr><th>7</th><td>64.0</td></tr></tbody></table></aside>
| <svg viewBox="0 0 600 300"><g transform="translate(50,30)"><g class="x axis" transform="translate(0,240)"><path class="domain" d="M0,6V0H530V6"></path></g><g class="y axis"><g class="tick" transform="translate(0,220)" style="opacity: 1;"><line x2="-6" y2="0"></line><text dy=".32em" x="-9" y="0" style="text-anchor: end;">10</text></g><g class="tick" transform="translate(0,180)" style="opacity: 1;"><line x2="-6" y2="0"></line><text dy=".32em" x="-9" y="0" style="text-anchor: end;">20</text></g><g class="tick" transform="translate(0,139.99999999999997)" style="opacity: 1;"><line x2="-6" y2="0"></line><text dy=".32em" x="-9" y="0" style="text-anchor: end;">30</text></g><g class="tick" transform="translate(0,99.99999999999999)" style="opacity: 1;"><line x2="-6" y2="0"></line><text dy=".32em" x="-9" y="0" style="text-anchor: end;">40</text></g><g class="tick" transform="translate(0,60)" style="opacity: 1;"><line x2="-6" y2="0"></line><text dy=".32em" x="-9" y="0" style="text-anchor: end;">50</text></g><g class="tick" transform="translate(0,20.000000000000007)" style="opacity: 1;"><line x2="-6" y2="0"></line><text dy=".32em" x="-9" y="0" style="text-anchor: end;">60</text></g><path class="domain" d="M-6,0H0V240H-6"></path></g><g class="signal"><line stroke="#2ca02c" x1="33.125" y1="228.00000000000006" x2="33.125" y2="240" style="stroke-width: 2;"></line><path transform="translate(33.125, 228.00000000000006)" fill="#2ca02c" d="M-4,-4L4,-4 4,4 -4,4Z"></path></g><g class="signal"><line stroke="#2ca02c" x1="99.375" y1="196" x2="99.375" y2="240" style="stroke-width: 2;"></line><path transform="translate(99.375, 196)" fill="#2ca02c" d="M-4,-4L4,-4 4,4 -4,4Z"></path></g><g class="signal"><line stroke="#2ca02c" x1="165.625" y1="163.99999999999997" x2="165.625" y2="240" style="stroke-width: 2;"></line><path transform="translate(165.625, 163.99999999999997)" fill="#2ca02c" d="M-4,-4L4,-4 4,4 -4,4Z"></path></g><g class="signal"><line stroke="#2ca02c" x1="231.875" y1="132.00000000000034" x2="231.875" y2="240" style="stroke-width: 2;"></line><path transform="translate(231.875, 132.00000000000034)" fill="#2ca02c" d="M-4,-4L4,-4 4,4 -4,4Z"></path></g><g class="signal"><line stroke="#2ca02c" x1="298.125" y1="99.99999999999949" x2="298.125" y2="240" style="stroke-width: 2;"></line><path transform="translate(298.125, 99.99999999999949)" fill="#2ca02c" d="M-4,-4L4,-4 4,4 -4,4Z"></path></g><g class="signal"><line stroke="#2ca02c" x1="364.375" y1="68.00000000000053" x2="364.375" y2="240" style="stroke-width: 2;"></line><path transform="translate(364.375, 68.00000000000053)" fill="#2ca02c" d="M-4,-4L4,-4 4,4 -4,4Z"></path></g><g class="signal"><line stroke="#2ca02c" x1="430.625" y1="35.9999999999996" x2="430.625" y2="240" style="stroke-width: 2;"></line><path transform="translate(430.625, 35.9999999999996)" fill="#2ca02c" d="M-4,-4L4,-4 4,4 -4,4Z"></path></g><g class="signal"><line stroke="#2ca02c" x1="496.875" y1="4.000000000000279" x2="496.875" y2="240" style="stroke-width: 2;"></line><path transform="translate(496.875, 4.000000000000279)" fill="#2ca02c" d="M-4,-4L4,-4 4,4 -4,4Z"></path></g></g></svg>

## Okay, but *why?*

Up to now, you may have noticed that each transformation has been of equivalent length; e.g., *n* samples become *n* coefficients and vice versa. So, how is this actually useful for compression?

Look again at the coefficients of our compressed signal:

[[figure|The computed DCT coefficients]]
| <aside><table class="pull"><thead><th></th><th>Value</th></thead><tbody><tr><th>0</th><td>101.8</td></tr><tr><th>1</th><td>-51.5</td></tr><tr><th>2</th><td>-0.0</td></tr><tr><th>3</th><td>-5.4</td></tr><tr><th>4</th><td>0.0</td></tr><tr><th>5</th><td>-1.6</td></tr><tr><th>6</th><td>-0.0</td></tr><tr><th>7</th><td>-0.4</td></tr></tbody></table></aside>
| <svg viewBox="0 0 600 300"><g transform="translate(50,30)"><g class="x axis" transform="translate(0,160.00000000000003)"><path class="domain" d="M0,6V0H530V6"></path></g><g class="y axis"><g class="tick" transform="translate(0,226.66666666666666)" style="opacity: 1;"><line x2="-6" y2="0"></line><text dy=".32em" x="-9" y="0" style="text-anchor: end;">-50</text></g><g class="tick" transform="translate(0,160.00000000000003)" style="opacity: 1;"><line x2="-6" y2="0"></line><text dy=".32em" x="-9" y="0" style="text-anchor: end;">0</text></g><g class="tick" transform="translate(0,93.33333333333331)" style="opacity: 1;"><line x2="-6" y2="0"></line><text dy=".32em" x="-9" y="0" style="text-anchor: end;">50</text></g><g class="tick" transform="translate(0,26.66666666666668)" style="opacity: 1;"><line x2="-6" y2="0"></line><text dy=".32em" x="-9" y="0" style="text-anchor: end;">100</text></g><path class="domain" d="M-6,0H0V240H-6"></path></g><g class="signal"><line stroke="#ff7f0e" x1="33.125" y1="24.235498012182866" x2="33.125" y2="160.00000000000003" style="stroke-width: 2;"></line><path transform="translate(33.125, 24.235498012182866)" fill="#ff7f0e" d="M0,-7.444838872816797L4.298279727294168,0 0,7.444838872816797 -4.298279727294168,0Z"></path></g><g class="signal"><line stroke="#ff7f0e" x1="99.375" y1="228.71811224218814" x2="99.375" y2="160.00000000000003" style="stroke-width: 2;"></line><path transform="translate(99.375, 228.71811224218814)" fill="#ff7f0e" d="M0,-7.444838872816797L4.298279727294168,0 0,7.444838872816797 -4.298279727294168,0Z"></path></g><g class="signal"><line stroke="#ff7f0e" x1="165.625" y1="160.00000000000003" x2="165.625" y2="160.00000000000003" style="stroke-width: 2;"></line><path transform="translate(165.625, 160.00000000000003)" fill="#ff7f0e" d="M0,-7.444838872816797L4.298279727294168,0 0,7.444838872816797 -4.298279727294168,0Z"></path></g><g class="signal"><line stroke="#ff7f0e" x1="231.875" y1="167.18351787630866" x2="231.875" y2="160.00000000000003" style="stroke-width: 2;"></line><path transform="translate(231.875, 167.18351787630866)" fill="#ff7f0e" d="M0,-7.444838872816797L4.298279727294168,0 0,7.444838872816797 -4.298279727294168,0Z"></path></g><g class="signal"><line stroke="#ff7f0e" x1="298.125" y1="160.00000000000003" x2="298.125" y2="160.00000000000003" style="stroke-width: 2;"></line><path transform="translate(298.125, 160.00000000000003)" fill="#ff7f0e" d="M0,-7.444838872816797L4.298279727294168,0 0,7.444838872816797 -4.298279727294168,0Z"></path></g><g class="signal"><line stroke="#ff7f0e" x1="364.375" y1="162.14296430651729" x2="364.375" y2="160.00000000000003" style="stroke-width: 2;"></line><path transform="translate(364.375, 162.14296430651729)" fill="#ff7f0e" d="M0,-7.444838872816797L4.298279727294168,0 0,7.444838872816797 -4.298279727294168,0Z"></path></g><g class="signal"><line stroke="#ff7f0e" x1="430.625" y1="160.00000000000017" x2="430.625" y2="160.00000000000003" style="stroke-width: 2;"></line><path transform="translate(430.625, 160.00000000000017)" fill="#ff7f0e" d="M0,-7.444838872816797L4.298279727294168,0 0,7.444838872816797 -4.298279727294168,0Z"></path></g><g class="signal"><line stroke="#ff7f0e" x1="496.875" y1="160.54082477610265" x2="496.875" y2="160.00000000000003" style="stroke-width: 2;"></line><path transform="translate(496.875, 160.54082477610265)" fill="#ff7f0e" d="M0,-7.444838872816797L4.298279727294168,0 0,7.444838872816797 -4.298279727294168,0Z"></path></g></g></svg>

Notice, that the *first two* coefficients have a relatively large magnitude, while the rest are fairly close to zero. This is because our source signal was a simple ramp: it's value increased by `8` units at each sample.

As such, most of the *energy* of the signal can be expressed in the lower frequencies, while the higher frequencies have *less* of an overall impact on the desired signal. The DCT exploits this property; this is referred to as *energy compaction*.

If our initial signal was comprised of white noise, i.e. static, there would be less -- if any -- energy compaction. However many real-world samples, whether aural or visual, the signals tend to be somewhat ordered, and better suited for this type of energy compaction.

***

We use can [quantization](http://en.wikipedia.org/wiki/Quantization_(image_processing)) to squash our coefficients, which are currently real numbers, into a smaller range of integers. As a simplistic implementation, we can divide each coefficient by `50`&mdash;the choice of `50` is a completely arbitrary selection on my part, it can be any number really for our purposes&mdash;and truncate the result.

```js
const quantizer = (v) => v/50|0;
const quantized = coefficients.map(quantizer);
```

[[figure|The quantized coefficients.]]
| <aside><table class="pull"><thead><th></th><th>Value</th></thead><tbody><tr><th>0</th><td>2.0</td></tr><tr><th>1</th><td>-1.0</td></tr><tr><th>2</th><td>0.0</td></tr><tr><th>3</th><td>0.0</td></tr><tr><th>4</th><td>0.0</td></tr><tr><th>5</th><td>0.0</td></tr><tr><th>6</th><td>0.0</td></tr><tr><th>7</th><td>0.0</td></tr></tbody></table></aside>
| <svg viewBox="0 0 600 300"><g transform="translate(50,30)"><g class="x axis" transform="translate(0,160.00000000000003)"><path class="domain" d="M0,6V0H530V6"></path></g><g class="y axis"><g class="tick" transform="translate(0,240)" style="opacity: 1;"><line x2="-6" y2="0"></line><text dy=".32em" x="-9" y="0" style="text-anchor: end;">-1.0</text></g><g class="tick" transform="translate(0,200)" style="opacity: 1;"><line x2="-6" y2="0"></line><text dy=".32em" x="-9" y="0" style="text-anchor: end;">-0.5</text></g><g class="tick" transform="translate(0,160.00000000000003)" style="opacity: 1;"><line x2="-6" y2="0"></line><text dy=".32em" x="-9" y="0" style="text-anchor: end;">0.0</text></g><g class="tick" transform="translate(0,120)" style="opacity: 1;"><line x2="-6" y2="0"></line><text dy=".32em" x="-9" y="0" style="text-anchor: end;">0.5</text></g><g class="tick" transform="translate(0,80.00000000000001)" style="opacity: 1;"><line x2="-6" y2="0"></line><text dy=".32em" x="-9" y="0" style="text-anchor: end;">1.0</text></g><g class="tick" transform="translate(0,39.99999999999999)" style="opacity: 1;"><line x2="-6" y2="0"></line><text dy=".32em" x="-9" y="0" style="text-anchor: end;">1.5</text></g><g class="tick" transform="translate(0,0)" style="opacity: 1;"><line x2="-6" y2="0"></line><text dy=".32em" x="-9" y="0" style="text-anchor: end;">2.0</text></g><path class="domain" d="M-6,0H0V240H-6"></path></g><g class="signal"><line stroke="#d62728" x1="33.125" y1="0" x2="33.125" y2="160.00000000000003" style="stroke-width: 2;"></line><path transform="translate(33.125, 0)" fill="#d62728" d="M0,5.26429605180997L6.078685485212741,-5.26429605180997 -6.078685485212741,-5.26429605180997Z"></path></g><g class="signal"><line stroke="#d62728" x1="99.375" y1="240" x2="99.375" y2="160.00000000000003" style="stroke-width: 2;"></line><path transform="translate(99.375, 240)" fill="#d62728" d="M0,5.26429605180997L6.078685485212741,-5.26429605180997 -6.078685485212741,-5.26429605180997Z"></path></g><g class="signal"><line stroke="#d62728" x1="165.625" y1="160.00000000000003" x2="165.625" y2="160.00000000000003" style="stroke-width: 2;"></line><path transform="translate(165.625, 160.00000000000003)" fill="#d62728" d="M0,5.26429605180997L6.078685485212741,-5.26429605180997 -6.078685485212741,-5.26429605180997Z"></path></g><g class="signal"><line stroke="#d62728" x1="231.875" y1="160.00000000000003" x2="231.875" y2="160.00000000000003" style="stroke-width: 2;"></line><path transform="translate(231.875, 160.00000000000003)" fill="#d62728" d="M0,5.26429605180997L6.078685485212741,-5.26429605180997 -6.078685485212741,-5.26429605180997Z"></path></g><g class="signal"><line stroke="#d62728" x1="298.125" y1="160.00000000000003" x2="298.125" y2="160.00000000000003" style="stroke-width: 2;"></line><path transform="translate(298.125, 160.00000000000003)" fill="#d62728" d="M0,5.26429605180997L6.078685485212741,-5.26429605180997 -6.078685485212741,-5.26429605180997Z"></path></g><g class="signal"><line stroke="#d62728" x1="364.375" y1="160.00000000000003" x2="364.375" y2="160.00000000000003" style="stroke-width: 2;"></line><path transform="translate(364.375, 160.00000000000003)" fill="#d62728" d="M0,5.26429605180997L6.078685485212741,-5.26429605180997 -6.078685485212741,-5.26429605180997Z"></path></g><g class="signal"><line stroke="#d62728" x1="430.625" y1="160.00000000000003" x2="430.625" y2="160.00000000000003" style="stroke-width: 2;"></line><path transform="translate(430.625, 160.00000000000003)" fill="#d62728" d="M0,5.26429605180997L6.078685485212741,-5.26429605180997 -6.078685485212741,-5.26429605180997Z"></path></g><g class="signal"><line stroke="#d62728" x1="496.875" y1="160.00000000000003" x2="496.875" y2="160.00000000000003" style="stroke-width: 2;"></line><path transform="translate(496.875, 160.00000000000003)" fill="#d62728" d="M0,5.26429605180997L6.078685485212741,-5.26429605180997 -6.078685485212741,-5.26429605180997Z"></path></g></g></svg>

After quantization, we now only have two coefficients that have values, and a long run of values of zero. This set can be [run-length encoded](http://en.wikipedia.org/wiki/Run-length_encoding) much smaller than the original set of samples.

This is *fundamentally* how the DCT is used for audio and visual compression.

## Lossy Compression

If you have a keen eye then you may have noticed something interesting during the quantization step in the last section. We *truncated* our real values into integers, i.e. we threw away some data.

While that made the data more compressible, what effect does that have on our reconstructed signal? Let's find out!

First, we need to de-quantize our coefficients:

```js
const dequantizer = v => v*50;
const dequantized = quantized.map(dequantizer);
```

[[figure|The dequantized coefficients.]]
| <aside><table class="pull"><thead><th></th><th>Value</th></thead><tbody><tr><th>0</th><td>100.0</td></tr><tr><th>1</th><td>-50.0</td></tr><tr><th>2</th><td>0.0</td></tr><tr><th>3</th><td>0.0</td></tr><tr><th>4</th><td>0.0</td></tr><tr><th>5</th><td>0.0</td></tr><tr><th>6</th><td>0.0</td></tr><tr><th>7</th><td>0.0</td></tr></tbody></table></aside>
| <svg viewBox="0 0 600 300"><g transform="translate(50,30)"><g class="x axis" transform="translate(0,150)"><path class="domain" d="M0,6V0H530V6"></path></g><g class="y axis"><g class="tick" transform="translate(0,225)" style="opacity: 1;"><line x2="-6" y2="0"></line><text dy=".32em" x="-9" y="0" style="text-anchor: end;">-50</text></g><g class="tick" transform="translate(0,150)" style="opacity: 1;"><line x2="-6" y2="0"></line><text dy=".32em" x="-9" y="0" style="text-anchor: end;">0</text></g><g class="tick" transform="translate(0,75)" style="opacity: 1;"><line x2="-6" y2="0"></line><text dy=".32em" x="-9" y="0" style="text-anchor: end;">50</text></g><g class="tick" transform="translate(0,0)" style="opacity: 1;"><line x2="-6" y2="0"></line><text dy=".32em" x="-9" y="0" style="text-anchor: end;">100</text></g><path class="domain" d="M-6,0H0V240H-6"></path></g><g class="signal"><line stroke="#9467bd" x1="33.125" y1="0" x2="33.125" y2="150" style="stroke-width: 2;"></line><path transform="translate(33.125, 0)" fill="#9467bd" d="M0,-5.26429605180997L6.078685485212741,5.26429605180997 -6.078685485212741,5.26429605180997Z"></path></g><g class="signal"><line stroke="#9467bd" x1="99.375" y1="225" x2="99.375" y2="150" style="stroke-width: 2;"></line><path transform="translate(99.375, 225)" fill="#9467bd" d="M0,-5.26429605180997L6.078685485212741,5.26429605180997 -6.078685485212741,5.26429605180997Z"></path></g><g class="signal"><line stroke="#9467bd" x1="165.625" y1="150" x2="165.625" y2="150" style="stroke-width: 2;"></line><path transform="translate(165.625, 150)" fill="#9467bd" d="M0,-5.26429605180997L6.078685485212741,5.26429605180997 -6.078685485212741,5.26429605180997Z"></path></g><g class="signal"><line stroke="#9467bd" x1="231.875" y1="150" x2="231.875" y2="150" style="stroke-width: 2;"></line><path transform="translate(231.875, 150)" fill="#9467bd" d="M0,-5.26429605180997L6.078685485212741,5.26429605180997 -6.078685485212741,5.26429605180997Z"></path></g><g class="signal"><line stroke="#9467bd" x1="298.125" y1="150" x2="298.125" y2="150" style="stroke-width: 2;"></line><path transform="translate(298.125, 150)" fill="#9467bd" d="M0,-5.26429605180997L6.078685485212741,5.26429605180997 -6.078685485212741,5.26429605180997Z"></path></g><g class="signal"><line stroke="#9467bd" x1="364.375" y1="150" x2="364.375" y2="150" style="stroke-width: 2;"></line><path transform="translate(364.375, 150)" fill="#9467bd" d="M0,-5.26429605180997L6.078685485212741,5.26429605180997 -6.078685485212741,5.26429605180997Z"></path></g><g class="signal"><line stroke="#9467bd" x1="430.625" y1="150" x2="430.625" y2="150" style="stroke-width: 2;"></line><path transform="translate(430.625, 150)" fill="#9467bd" d="M0,-5.26429605180997L6.078685485212741,5.26429605180997 -6.078685485212741,5.26429605180997Z"></path></g><g class="signal"><line stroke="#9467bd" x1="496.875" y1="150" x2="496.875" y2="150" style="stroke-width: 2;"></line><path transform="translate(496.875, 150)" fill="#9467bd" d="M0,-5.26429605180997L6.078685485212741,5.26429605180997 -6.078685485212741,5.26429605180997Z"></path></g></g></svg>

Notice they are *not* the same as the coefficients we calculated before, due to the truncation. Now, let's run the inverse DCT and see what signal we get back:

```js
const decompressedSignal = idct1d(dequantized);
```

[[figure|The reconstructed decompressed signal.]]
| <aside><table class="pull"><thead><th></th><th>Value</th></thead><tbody><tr><th>0</th><td>10.8</td></tr><tr><th>1</th><td>14.6</td></tr><tr><th>2</th><td>21.5</td></tr><tr><th>3</th><td>30.5</td></tr><tr><th>4</th><td>40.2</td></tr><tr><th>5</th><td>49.2</td></tr><tr><th>6</th><td>56.1</td></tr><tr><th>7</th><td>59.9</td></tr></tbody></table></aside>
| <svg viewBox="0 0 600 300"><g transform="translate(50,30)"><g class="x axis" transform="translate(0,240)"><path class="domain" d="M0,6V0H530V6"></path></g><g class="y axis"><g class="tick" transform="translate(0,240)" style="opacity: 1;"><line x2="-6" y2="0"></line><text dy=".32em" x="-9" y="0" style="text-anchor: end;">10</text></g><g class="tick" transform="translate(0,192)" style="opacity: 1;"><line x2="-6" y2="0"></line><text dy=".32em" x="-9" y="0" style="text-anchor: end;">20</text></g><g class="tick" transform="translate(0,144)" style="opacity: 1;"><line x2="-6" y2="0"></line><text dy=".32em" x="-9" y="0" style="text-anchor: end;">30</text></g><g class="tick" transform="translate(0,96)" style="opacity: 1;"><line x2="-6" y2="0"></line><text dy=".32em" x="-9" y="0" style="text-anchor: end;">40</text></g><g class="tick" transform="translate(0,47.999999999999986)" style="opacity: 1;"><line x2="-6" y2="0"></line><text dy=".32em" x="-9" y="0" style="text-anchor: end;">50</text></g><g class="tick" transform="translate(0,0)" style="opacity: 1;"><line x2="-6" y2="0"></line><text dy=".32em" x="-9" y="0" style="text-anchor: end;">60</text></g><path class="domain" d="M-6,0H0V240H-6"></path></g><g class="signal"><line stroke="#8c564b" x1="33.125" y1="235.98860616361628" x2="33.125" y2="240" style="stroke-width: 2;"></line><path transform="translate(33.125, 235.98860616361628)" fill="#8c564b" d="M0,4.51351666838205A4.51351666838205,4.51351666838205 0 1,1 0,-4.51351666838205A4.51351666838205,4.51351666838205 0 1,1 0,4.51351666838205Z"></path></g><g class="signal"><line stroke="#8c564b" x1="99.375" y1="218.07072599153403" x2="99.375" y2="240" style="stroke-width: 2;"></line><path transform="translate(99.375, 218.07072599153403)" fill="#8c564b" d="M0,4.51351666838205A4.51351666838205,4.51351666838205 0 1,1 0,-4.51351666838205A4.51351666838205,4.51351666838205 0 1,1 0,4.51351666838205Z"></path></g><g class="signal"><line stroke="#8c564b" x1="165.625" y1="184.96280047758088" x2="165.625" y2="240" style="stroke-width: 2;"></line><path transform="translate(165.625, 184.96280047758088)" fill="#8c564b" d="M0,4.51351666838205A4.51351666838205,4.51351666838205 0 1,1 0,-4.51351666838205A4.51351666838205,4.51351666838205 0 1,1 0,4.51351666838205Z"></path></g><g class="signal"><line stroke="#8c564b" x1="231.875" y1="141.705211157164" x2="231.875" y2="240" style="stroke-width: 2;"></line><path transform="translate(231.875, 141.705211157164)" fill="#8c564b" d="M0,4.51351666838205A4.51351666838205,4.51351666838205 0 1,1 0,-4.51351666838205A4.51351666838205,4.51351666838205 0 1,1 0,4.51351666838205Z"></path></g><g class="signal"><line stroke="#8c564b" x1="298.125" y1="94.88353387329325" x2="298.125" y2="240" style="stroke-width: 2;"></line><path transform="translate(298.125, 94.88353387329325)" fill="#8c564b" d="M0,4.51351666838205A4.51351666838205,4.51351666838205 0 1,1 0,-4.51351666838205A4.51351666838205,4.51351666838205 0 1,1 0,4.51351666838205Z"></path></g><g class="signal"><line stroke="#8c564b" x1="364.375" y1="51.62594455287639" x2="364.375" y2="240" style="stroke-width: 2;"></line><path transform="translate(364.375, 51.62594455287639)" fill="#8c564b" d="M0,4.51351666838205A4.51351666838205,4.51351666838205 0 1,1 0,-4.51351666838205A4.51351666838205,4.51351666838205 0 1,1 0,4.51351666838205Z"></path></g><g class="signal"><line stroke="#8c564b" x1="430.625" y1="18.518019038923185" x2="430.625" y2="240" style="stroke-width: 2;"></line><path transform="translate(430.625, 18.518019038923185)" fill="#8c564b" d="M0,4.51351666838205A4.51351666838205,4.51351666838205 0 1,1 0,-4.51351666838205A4.51351666838205,4.51351666838205 0 1,1 0,4.51351666838205Z"></path></g><g class="signal"><line stroke="#8c564b" x1="496.875" y1="0.6001388668409735" x2="496.875" y2="240" style="stroke-width: 2;"></line><path transform="translate(496.875, 0.6001388668409735)" fill="#8c564b" d="M0,4.51351666838205A4.51351666838205,4.51351666838205 0 1,1 0,-4.51351666838205A4.51351666838205,4.51351666838205 0 1,1 0,4.51351666838205Z"></path></g></g></svg>


At first glance, the reconstructed signal appears *similar*. However, on closer inspection, you can see they are actually different. That is because we threw away some of the smaller, high-frequency coefficients that were subtly adjusting the reconstructed signal. Without those frequencies, the new signal drifts away from the original.

However, compare them together on the same chart:

[[figure|Both the original signal and reconstructed decompressed signal.]]
| <aside>
| <table class="pull">
| <thead><th></th><th colspan="2">Value</th><th>±</th></thead>
| <tbody>
|   <tr><th>0</th><td>8.0</td><td>10.8</td><th>&plus;2.8</th></tr>
|   <tr><th>1</th><td>16.0</td><td>14.6</td><th>&minus;1.4</th></tr>
|   <tr><th>2</th><td>24.0</td><td>21.5</td><th>&minus;2.5</th></tr>
|   <tr><th>3</th><td>32.0</td><td>30.5</td><th>&minus;1.5</th></tr>
|   <tr><th>4</th><td>40.0</td><td>40.2</td><th>&plus;0.2</th></tr>
|   <tr><th>5</th><td>48.0</td><td>49.2</td><th>&plus;1.2</th></tr>
|   <tr><th>6</th><td>56.0</td><td>56.1</td><th>&plus;0.1</th></tr>
|   <tr><th>7</th><td>64.0</td><td>59.9</td><th>&minus;4.1</th></tr>
| </tbody>
| </table>
| </aside>
| <svg viewBox="0 0 600 300"><g transform="translate(50,30)"><g class="x axis" transform="translate(0,240)"><path class="domain" d="M0,6V0H530V6"></path></g><g class="y axis"><g class="tick" transform="translate(0,220)" style="opacity: 1;"><line x2="-6" y2="0"></line><text dy=".32em" x="-9" y="0" style="text-anchor: end;">10</text></g><g class="tick" transform="translate(0,180)" style="opacity: 1;"><line x2="-6" y2="0"></line><text dy=".32em" x="-9" y="0" style="text-anchor: end;">20</text></g><g class="tick" transform="translate(0,139.99999999999997)" style="opacity: 1;"><line x2="-6" y2="0"></line><text dy=".32em" x="-9" y="0" style="text-anchor: end;">30</text></g><g class="tick" transform="translate(0,99.99999999999999)" style="opacity: 1;"><line x2="-6" y2="0"></line><text dy=".32em" x="-9" y="0" style="text-anchor: end;">40</text></g><g class="tick" transform="translate(0,60)" style="opacity: 1;"><line x2="-6" y2="0"></line><text dy=".32em" x="-9" y="0" style="text-anchor: end;">50</text></g><g class="tick" transform="translate(0,20.000000000000007)" style="opacity: 1;"><line x2="-6" y2="0"></line><text dy=".32em" x="-9" y="0" style="text-anchor: end;">60</text></g><path class="domain" d="M-6,0H0V240H-6"></path></g><g class="signal2"><line stroke="#8c564b" x1="33.125" y1="216.65717180301357" x2="33.125" y2="240" style="stroke-width: 2;"></line><path transform="translate(33.125, 216.65717180301357)" fill="#8c564b" d="M0,4.51351666838205A4.51351666838205,4.51351666838205 0 1,1 0,-4.51351666838205A4.51351666838205,4.51351666838205 0 1,1 0,4.51351666838205Z"></path></g><g class="signal2"><line stroke="#8c564b" x1="99.375" y1="201.72560499294502" x2="99.375" y2="240" style="stroke-width: 2;"></line><path transform="translate(99.375, 201.72560499294502)" fill="#8c564b" d="M0,4.51351666838205A4.51351666838205,4.51351666838205 0 1,1 0,-4.51351666838205A4.51351666838205,4.51351666838205 0 1,1 0,4.51351666838205Z"></path></g><g class="signal2"><line stroke="#8c564b" x1="165.625" y1="174.13566706465073" x2="165.625" y2="240" style="stroke-width: 2;"></line><path transform="translate(165.625, 174.13566706465073)" fill="#8c564b" d="M0,4.51351666838205A4.51351666838205,4.51351666838205 0 1,1 0,-4.51351666838205A4.51351666838205,4.51351666838205 0 1,1 0,4.51351666838205Z"></path></g><g class="signal2"><line stroke="#8c564b" x1="231.875" y1="138.08767596430334" x2="231.875" y2="240" style="stroke-width: 2;"></line><path transform="translate(231.875, 138.08767596430334)" fill="#8c564b" d="M0,4.51351666838205A4.51351666838205,4.51351666838205 0 1,1 0,-4.51351666838205A4.51351666838205,4.51351666838205 0 1,1 0,4.51351666838205Z"></path></g><g class="signal2"><line stroke="#8c564b" x1="298.125" y1="99.06961156107769" x2="298.125" y2="240" style="stroke-width: 2;"></line><path transform="translate(298.125, 99.06961156107769)" fill="#8c564b" d="M0,4.51351666838205A4.51351666838205,4.51351666838205 0 1,1 0,-4.51351666838205A4.51351666838205,4.51351666838205 0 1,1 0,4.51351666838205Z"></path></g><g class="signal2"><line stroke="#8c564b" x1="364.375" y1="63.02162046073033" x2="364.375" y2="240" style="stroke-width: 2;"></line><path transform="translate(364.375, 63.02162046073033)" fill="#8c564b" d="M0,4.51351666838205A4.51351666838205,4.51351666838205 0 1,1 0,-4.51351666838205A4.51351666838205,4.51351666838205 0 1,1 0,4.51351666838205Z"></path></g><g class="signal2"><line stroke="#8c564b" x1="430.625" y1="35.43168253243599" x2="430.625" y2="240" style="stroke-width: 2;"></line><path transform="translate(430.625, 35.43168253243599)" fill="#8c564b" d="M0,4.51351666838205A4.51351666838205,4.51351666838205 0 1,1 0,-4.51351666838205A4.51351666838205,4.51351666838205 0 1,1 0,4.51351666838205Z"></path></g><g class="signal2"><line stroke="#8c564b" x1="496.875" y1="20.500115722367454" x2="496.875" y2="240" style="stroke-width: 2;"></line><path transform="translate(496.875, 20.500115722367454)" fill="#8c564b" d="M0,4.51351666838205A4.51351666838205,4.51351666838205 0 1,1 0,-4.51351666838205A4.51351666838205,4.51351666838205 0 1,1 0,4.51351666838205Z"></path></g><g class="signal"><line stroke="#1f77b4" x1="33.125" y1="228" x2="33.125" y2="240" style="stroke-width: 2;"></line><path transform="translate(33.125, 228)" fill="#1f77b4" d="M-5.366563145999495,-1.7888543819998317H-1.7888543819998317V-5.366563145999495H1.7888543819998317V-1.7888543819998317H5.366563145999495V1.7888543819998317H1.7888543819998317V5.366563145999495H-1.7888543819998317V1.7888543819998317H-5.366563145999495Z"></path></g><g class="signal"><line stroke="#1f77b4" x1="99.375" y1="196" x2="99.375" y2="240" style="stroke-width: 2;"></line><path transform="translate(99.375, 196)" fill="#1f77b4" d="M-5.366563145999495,-1.7888543819998317H-1.7888543819998317V-5.366563145999495H1.7888543819998317V-1.7888543819998317H5.366563145999495V1.7888543819998317H1.7888543819998317V5.366563145999495H-1.7888543819998317V1.7888543819998317H-5.366563145999495Z"></path></g><g class="signal"><line stroke="#1f77b4" x1="165.625" y1="164" x2="165.625" y2="240" style="stroke-width: 2;"></line><path transform="translate(165.625, 164)" fill="#1f77b4" d="M-5.366563145999495,-1.7888543819998317H-1.7888543819998317V-5.366563145999495H1.7888543819998317V-1.7888543819998317H5.366563145999495V1.7888543819998317H1.7888543819998317V5.366563145999495H-1.7888543819998317V1.7888543819998317H-5.366563145999495Z"></path></g><g class="signal"><line stroke="#1f77b4" x1="231.875" y1="132" x2="231.875" y2="240" style="stroke-width: 2;"></line><path transform="translate(231.875, 132)" fill="#1f77b4" d="M-5.366563145999495,-1.7888543819998317H-1.7888543819998317V-5.366563145999495H1.7888543819998317V-1.7888543819998317H5.366563145999495V1.7888543819998317H1.7888543819998317V5.366563145999495H-1.7888543819998317V1.7888543819998317H-5.366563145999495Z"></path></g><g class="signal"><line stroke="#1f77b4" x1="298.125" y1="99.99999999999999" x2="298.125" y2="240" style="stroke-width: 2;"></line><path transform="translate(298.125, 99.99999999999999)" fill="#1f77b4" d="M-5.366563145999495,-1.7888543819998317H-1.7888543819998317V-5.366563145999495H1.7888543819998317V-1.7888543819998317H5.366563145999495V1.7888543819998317H1.7888543819998317V5.366563145999495H-1.7888543819998317V1.7888543819998317H-5.366563145999495Z"></path></g><g class="signal"><line stroke="#1f77b4" x1="364.375" y1="68" x2="364.375" y2="240" style="stroke-width: 2;"></line><path transform="translate(364.375, 68)" fill="#1f77b4" d="M-5.366563145999495,-1.7888543819998317H-1.7888543819998317V-5.366563145999495H1.7888543819998317V-1.7888543819998317H5.366563145999495V1.7888543819998317H1.7888543819998317V5.366563145999495H-1.7888543819998317V1.7888543819998317H-5.366563145999495Z"></path></g><g class="signal"><line stroke="#1f77b4" x1="430.625" y1="36.00000000000001" x2="430.625" y2="240" style="stroke-width: 2;"></line><path transform="translate(430.625, 36.00000000000001)" fill="#1f77b4" d="M-5.366563145999495,-1.7888543819998317H-1.7888543819998317V-5.366563145999495H1.7888543819998317V-1.7888543819998317H5.366563145999495V1.7888543819998317H1.7888543819998317V5.366563145999495H-1.7888543819998317V1.7888543819998317H-5.366563145999495Z"></path></g><g class="signal"><line stroke="#1f77b4" x1="496.875" y1="4.000000000000012" x2="496.875" y2="240" style="stroke-width: 2;"></line><path transform="translate(496.875, 4.000000000000012)" fill="#1f77b4" d="M-5.366563145999495,-1.7888543819998317H-1.7888543819998317V-5.366563145999495H1.7888543819998317V-1.7888543819998317H5.366563145999495V1.7888543819998317H1.7888543819998317V5.366563145999495H-1.7888543819998317V1.7888543819998317H-5.366563145999495Z"></path></g></g></svg>


Not quite the same, but close&mdash;and that's the idea. We can use the DCT, to transform our set into a more *compressible* set data that can be reconstructed into a *similar* signal, but not identical. We have, however, *lost* some of the original data in the process; that is what is meant by "lossy" compression.

By adjusting the quantization value (or using a quantization matrix), one can control the balance between compressibility and signal fidelity of the transformation.

## Next up...

Let's explore deeper into the DCT:

* Visualization: Behold the waveforms of the DCT and how the signal is regenerated.
* Take it to the Next Dimension: Look at some 2D versions of the DCT.
* Indiana Jones: Explore some visual implications/artifacts of compression.

## More Reading

* [Discrete Cosine Transform](https://unix4lyfe.org/dct-1d/)
* [What is 'energy compaction' in simple terms?](http://dsp.stackexchange.com/questions/17326/what-is-energy-compaction-in-simple-terms)

<style>
.axis path, .axis line {
  fill: none;
  stroke: currentColor;
}

.axis .tick text {
  font-size: 0.65rem;
  fill: currentColor;
}
</style>

