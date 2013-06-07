package ghino

import org.gradle.api.*
import org.gradle.api.plugins.*
import org.gradle.api.tasks.*

class GhinoPlugin implements Plugin<Project> {

  void apply(final Project project) {

    project.apply plugin: "java"

    project.jar {
      manifest { attributes "Main-Class": "ghino.Main" }
    }

    project.configurations { onejar }

    project.dependencies {
      onejar "com.simontuffs:one-jar-ant-task:0.97"
      compile "org.akhikhl.ghino:ghino-runner:0.0.1"
    }

    project.task("copyDependencies", type: Copy) {
      from project.configurations.runtime
      into "${project.buildDir}/dependencies"
    }
    project.tasks.copyDependencies.dependsOn "assemble", "check"

    // if(project.tasks.build.dependsOnTaskDidWork() || project.tasks.assemble.dependsOnTaskDidWork())

    project.task("buildOneJar") {
      inputs.dir "${project.buildDir}/libs"
      inputs.dir "${project.buildDir}/dependencies"
      def outputDir = "${project.buildDir}/output"
      outputs.dir outputDir
      doLast {
        ant.taskdef(name: 'onejar', classname: "com.simontuffs.onejar.ant.OneJarTask", classpath: project.configurations.onejar.asPath)
        def destFile = "${outputDir}/${project.name}-${project.version}.jar"
        new File("${project.buildDir}/dependencies").mkdirs()
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
    project.tasks.buildOneJar.dependsOn "copyDependencies"

    project.tasks.build.dependsOn "buildOneJar"
  }
}
