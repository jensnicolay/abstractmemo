abstractmemo
============

Running the benchmarks
----------------------

### In D8 (shell for V8) or SpiderMonkey (Mozilla)

Mainly tested with D8 version 3.20.15.
Also tested with a recent release (downloaded Nov 2013) of SpiderMonkey 17.

In the root of the project, execute ``load("build.js")``.
To run the benchmarks from the paper, run ``computeResults(m)``, where ``m`` is the time-out for an instance of the analysis in minutes.
To dump the results in (crude) Latex, you can run ``dumpLatex()``.


Visualizazing the Dyck configuration graph
------------------------------------------

### In Chrome or Firefox

Point your browser at ``lcipda2.html`` and enter a small program. Press ``evaluate``.
For inspiration regarding test programs, look in the directory ``test/resources``.
