mkdir <UR FOLDER> && cd <UR FOLDER>

cdk8s init typescript-app

npm install
npm run build // test fails but it's okay

kubectl get all

npm run build && kubectl apply -f dist/

kubectl delete -f dist/