package ghino

import org.gradle.api.*
import org.gradle.api.plugins.*
import org.gradle.api.tasks.*

class GhinoPlugin implements Plugin<Project> {

  void apply(final Project project) {
    
    project.apply plugin: "java"
    
    project.jar {
      manifest { attributes "Main-Class": "ghino.GhinoRunner" }
    }

    project.configurations {
      onejar
    }

    project.dependencies {
      onejar "com.simontuffs:one-jar-ant-task:0.97"
      compile "org.akhikhl:ghino-runner:0.0.1"
    }

    if(!project.tasks.findByName("copyDependencies")) {
      project.task([ type: Copy ], "copyDependencies") {
        from project.configurations.runtime
        into "${project.buildDir}/dependencies"
      }
    }

    project.task("buildOneJar") {
      dependsOn "copyDependencies"
      dependsOn "assemble"
      dependsOn "test"
      def outputDir = "${project.buildDir}/output"
      outputs.file "${outputDir}/${project.name}-${project.version}.jar"
      doLast {
        ant.taskdef(name: 'onejar', classname: "com.simontuffs.onejar.ant.OneJarTask", classpath: project.configurations.onejar.asPath)
        def destFile = "${outputDir}/${project.name}-${project.version}.jar"
        new File("${project.buildDir}/dependencies").mkdirs();
        ant.onejar(destFile: destFile) {
          main(jar: project.tasks.jar.archivePath.toString())
          manifest {
            attribute(name: "Built-By", value: System.getProperty("user.name"))
          }
          lib {
            fileset(dir: "${project.buildDir}/dependencies")
          }
        }
        File launchScriptFile = new File("${outputDir}/${project.name}-${project.version}.sh")
        launchScriptFile.text = "#!/bin/bash\njava -jar ${project.name}-${project.version}.jar \"\$@\""
        launchScriptFile.setExecutable(true)
        launchScriptFile = new File("${outputDir}/${project.name}-${project.version}.bat")
        launchScriptFile.text = "@java -jar ${project.name}-${project.version}.jar %*"
        project.logger.info "Created one-jar: " + destFile
      }
    }
    
    project.tasks.build.dependsOn project.tasks.buildOneJar
  }
}
