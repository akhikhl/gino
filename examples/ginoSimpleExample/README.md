#ginoSimpleExample

This is example program showing how to build simplest gino-application

##Compilation

```shell
gradle build
```

##Important details

There is "main" javascript file, which is invoked on program startup.

You can specify custom "main" javascript file by manifest entry:

```
Gino-Javascript: some/valid/classpath/myMain.js
```

By default (when Gino-Javascript is not specified) Gino will search for
"main.js" (in the root, without path).     

##Running under eclipse

To ensure that "Run As Java Application" works under eclipse (with Gino),
you'll need to perform additional tweaks:

1. If you want to specify Gino-Javascript manifest-entry, you should create 
   manifest file, containing Gino-Javascript entry) in "src/main/resources", 
   so that gradle copies it to "build/main/resources".
   
2. Regardless of whether you specify Gino-Javascript or not, Eclipse 
   run-configuration (which is created after first call to
   "Run As Java Application") should be tweaked:
   2.1 Open "Run Configurations" dialog, select the target configuration.
   2.2 Switch to "Classpath" tab.
   2.3 Click on "User Entries" in the list, click on "Advanced" button.
   2.4 In "Advanced Options" dialog select "Add Folders", click "OK".
   2.5 Select the target project, expand to folder "build/resources/main", click "OK".
   2.6 In "Run Configurations" dialog: click "Apply", "Close".
 
You don't need to perform these tweaks, if you are not going to use
"Run As Java Application".