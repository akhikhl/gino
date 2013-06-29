package gino

import org.gradle.api.*
import org.gradle.api.plugins.*
import org.gradle.api.tasks.*

class GinoAppPlugin implements Plugin<Project> {

  void apply(final Project project) {

    project.apply plugin: 'onejar'

    project.extensions.create('run', RunExtension)

    project.jar {
      manifest { attributes 'Main-Class': 'gino.Main' }
    }

    project.dependencies { compile 'org.akhikhl.gino:gino-runner:0.0.1' }

    project.task('run') { task ->
      task.dependsOn project.tasks.classes
      task.doLast {
        def urls = [
          new File("${project.buildDir}/classes/main").toURI().toURL(),
          new File("${project.buildDir}/resources/main").toURI().toURL()
        ]
        urls += project.configurations['runtime'].collect { dep ->
          dep.toURI().toURL()
        }
        URLClassLoader classLoader = new URLClassLoader(urls as URL[], GinoAppPlugin.class.classLoader)
        def runFolder = new File("${project.buildDir}/resources/runFolder")
        runFolder.mkdirs()
        gino.Main.run(project.run.args as String[], classLoader, logger, runFolder.absolutePath)
      }
    }
  }
}
