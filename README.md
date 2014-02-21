abstractmemo
============

Running the benchmarks
----------------------

### In D8 (shell for V8) or SpiderMonkey (Mozilla)

Mainly tested with D8 version 3.20.15, and somewhat with SpiderMonkey 17.

In the root of the project, execute ``load("build.js")``.
To run the benchmarks from the paper, run ``computeResults(m)``, where ``m`` is the time-out for an instance of the analysis in minutes.
To dump the results in (crude) Latex, you can run ``dumpLatex()``.


Visualizazing the Dyck state graph
------------------------------------------

### In Chrome or Firefox

Point your browser at ``amemo.html`` and input a small program.
For inspiration regarding test programs, look in the directory ``test/resources``.
Press ``eval`` to evaluate the program.
After evaluation, the state graph will appear at the bottom.
In a console, you have access to the ``dsg`` itself, its ``states``, and its ``edges``.
A state is a tuple ``(q,ss)`` where ``q`` is the CES component, and ``ss`` is the stack summary.
