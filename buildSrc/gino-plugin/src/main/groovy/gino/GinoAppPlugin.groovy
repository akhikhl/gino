package gino

import org.gradle.api.*
import org.gradle.api.plugins.*
import org.gradle.api.tasks.*

class GinoAppPlugin implements Plugin<Project> {

  void apply(final Project project) {

    project.apply plugin: 'onejar'

    project.extensions.create('run', RunExtension)

    project.ext.mainClass = 'gino.Main'

    project.dependencies { compile 'org.akhikhl.gino:gino-runner:0.0.6' }
  }
}
