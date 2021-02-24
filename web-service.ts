import { Construct } from 'constructs';
import { Names } from 'cdk8s';
import { KubeDeployment, KubeService, KubeHorizontalPodAutoscaler, Quantity } from './imports/k8s';

export interface WebServiceOptions {

  readonly image: string; // must-have option
  readonly replicas?: number; // default to 1
  readonly port?: number; // default to 80
  readonly containerPort?: number; // default to 8080
}

export class WebService extends Construct {
  constructor(scope: Construct, id: string, props: WebServiceOptions) {
    super(scope, id);

    const port = props.port || 80;
    const containerPort = props.containerPort || 8080;
    const replicas = props.replicas || 1;
    const label = { app: Names.toLabelValue(this) };

    // define resources here
    const deployment = new KubeDeployment(this, 'deployment', {
      spec: {
        replicas, 
        selector: {
          matchLabels: label
        },
        template: {
          metadata: {
            labels: label
          },
          spec: {
            containers: [
              {
                name: 'sample-app',
                image: props.image,
                ports: [
                  {
                    containerPort
                  }
                ],
                resources: {
                  requests: {
                    "cpu": Quantity.fromString("64Mi"),
                    "memory": Quantity.fromString("256m")
                  },
                  limits: {
                    "cpu": Quantity.fromString("128Mi"),
                    "memory": Quantity.fromString("512m")
                  }
                }
              }
            ]
          }
        }
      }
    })

    new KubeHorizontalPodAutoscaler(this, 'hpa', {
      spec: {
        scaleTargetRef: {
          apiVersion: deployment.apiVersion,
          kind: deployment.kind,
          name: deployment.name
        },
        minReplicas: 2,
        maxReplicas: 100,
        metrics: [
          {
            type: "Resource",
            resource: {
              name: "cpu",
              target: {
                type: "Utilization",
                averageValue: Quantity.fromNumber(80)
              }
            }
          }
        ]
      }
    })

    new KubeService(this, 'service', {
      spec: {
        type: 'LoadBalancer',
        ports: [{
          port,
          targetPort: containerPort
        }],
        selector: label
      }
    })

  }
}