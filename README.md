
# restcapt

[cuty]: http://cutycapt.sf.net
[xvfb]: http://manpages.ubuntu.com/manpages/precise/man1/Xvfb.1.html

## usage

<table>
<tr><td>auth</td>
<td>Required. Authentication token.</td></tr>

<tr><td>url</td>
<td>Required. Address of the page to be captured.</td></tr>

<tr><td>upload</td>
<td>Required. Address to receive the captured image.</td></tr>

<tr><td>delay</td>
<td>Passed to cutycapt (as --delay). Default is 1000.</td></tr>

<tr><td>width</td>
<td>Passed to Xvfb (as -screen) and to cutycapt (as --min-width). Default is 800.</td></tr>

<tr><td>height</td>
<td>Passed to Xvfb (as -screen) and to cutycapt (as --min-height). Default is 600.</td></tr>

<tr><td>javascript</td>
<td>Passed to cutycapt (as --javascript). Default is "on".</td></tr>
</table>

See the [cutycapt][cuty] homepage and [Xvfb][xvfb] manual for more information.
