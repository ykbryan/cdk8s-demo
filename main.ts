import { Construct } from 'constructs';
import { App, Chart, ChartProps } from 'cdk8s';
import { WebService } from './web-service';

export class MyChart extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = { }) {
    super(scope, id, props);

    // define resources here

    new WebService(this, 'sample-app', {
      image: 'bryanchua/sample-expressjs-microservice:latest',
      replicas: 2,
      containerPort: 3000
    })

    new WebService(this, 'sample-gateway', {
      image: 'bryanchua/sample-expressjs-gateway:latest',
      replicas: 2,
      containerPort: 3001
    })
    
  }
}

const app = new App();
new MyChart(app, 'cdk8s-demo');
app.synth();
