import { Router } from 'express';
const btoa = require('btoa')
const request = require('request-promise-native');
const { WebhookClient } = require('dialogflow-fulfillment');
const { Card, Suggestion } = require('dialogflow-fulfillment');

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
class DialogFlowBot {

    intentMap = new Map();
    agent: any;
    router: any;
    constructor() {
        this.router = Router();
        this.mountAgent();

    }

    init() {

        this.intentMap.set('Default Welcome Intent',
            this.welcomeHandler.bind(this));
        this.intentMap.set('offers',
            this.offersHandler.bind(this));
        this.intentMap.set('midPack',
            this.startPayment.bind(this));
        this.intentMap.set('Blogs intent',
            this.searchBlogs.bind(this));

        this.agent.handleRequest(this.intentMap);
        console.log('initialized agent')

    }

    createPayloadForDialogFlow(msg: any) {
        return btoa(JSON.stringify(msg));
    }
    public mountAgent() {

        this.router.all('*', (req: any, res: any) => {
            //console.log(this.agent, req.body)
            if (!this.agent) {
                this.agent = new WebhookClient({
                    request: req,
                    response: res
                })

                this.init()
            }
        });
    }
    private welcomeHandler(agent: any) {

        const welcomeMsg = {
            text: 'Hi there, I am proco bot. How can I help you today',
            chips: [
                {
                    text: 'Show offers',
                    input: 'offers'
                }
            ]
        }
        agent.add(this.createPayloadForDialogFlow(welcomeMsg))
    }


    private offersHandler(agent: any) {

        const offersMsg = {
            text: 'We are offering the below ',
            chips: [
                {
                    text: 'Buy any 2 Courses at 3000',
                    input: 'smallPack'
                },

                {
                    text: 'Buy any 3 Courses at 4000',
                    input: 'midPack'
                },

                {
                    text: 'Buy any 5 Courses at 5000',
                    input: 'largePack'
                }
            ]

        }
        agent.add(this.createPayloadForDialogFlow(offersMsg))
    }

    startPayment(agent: any) {
        const offerDetails = {
            midPack: {
                text: 'You can pay 4000 and then choose any 3 courses',
                chips: [

                    {
                        text: 'Pay INR 4000',
                        webURL: 'https://proco.guru:8442/paytm/process-payment?courseId=NWVhOTc3NjI0YzE0ZTE1YWU3Yjg3MmE0&routerLink=aHR0cHM6Ly9wcm9jby5ndXJ1Ly9jb3Vyc2VzL2RldGFpbHMvbGVhcm4tbm9kZWpzLXR5cGVzY3JpcHQtc2VydmVyLXdpdGgtbXVsdGlwbGUtZGVwbG95bWVudC10eXBl&courseAmount=MzUwMA==&t=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZWFiZjljMGU4MWM2NDNhZGQwMGI0ODYiLCJuYW1lIjoiQmh1c2hhbiIsInVzZXJJZCI6ImVyLm1yLmJodXNoYW5AZ21haWwuY29tIiwicGFzc3dvcmQiOiJRbWgxYzJoaGJnPT0iLCJtb2JpbGVOdW1iZXIiOiI5OTcwOTA1NjA4IiwiX192IjowLCJpZCI6IjVlYWJmOWMwZTgxYzY0M2FkZDAwYjQ4NiIsImFjY2VzcyI6eyJyZWFkIjp0cnVlLCJ3cml0ZSI6ZmFsc2V9LCJpYXQiOjE1ODgzMjg4OTcsImV4cCI6MTU4ODQxNTI5NywiaXNzIjoic29jLWF1dGgtc2VydmVyIn0.OLw-ckQe_7oRFbSIIbFSXnL0EccKSMdM6JLoBXieqRw&courseLink=aHR0cHM6Ly9wcm9jby5ndXJ1Ly9sZWFybi9sZWFybi1ub2RlanMtdHlwZXNjcmlwdC1zZXJ2ZXItd2l0aC1tdWx0aXBsZS1kZXBsb3ltZW50LXR5cGU=',
                        type: 'webURL'
                    },
                    {
                        text: 'Pay $ 50',
                        webURL: 'https://proco.guru?payment=50&currency=USD',
                        type: 'webURL'
                    }
                ]
            }
        }
        agent.add(this.createPayloadForDialogFlow(offerDetails.midPack))

    }


    searchBlogs(agent: any) {
        console.log(agent)
        // agent.add('Started searching')
        return request
            .get(`https://proco.guru:8442/article/search?searchQuery=${agent.query}`)
            .then((body: any) => {
                try {
                    body = JSON.parse(body)
                } catch (error) {

                }
                const searchResults = {
                    text: 'Please find the blogs you may be interested in',
                    chips: body.map((x: any) => {
                        return {
                            text: x.title,
                            type: 'webURL',
                            webURL: `https://proco.guru${x.routerLink}`
                        }
                    })
                }

                console.log(searchResults)
                agent.add(this.createPayloadForDialogFlow(searchResults));
                return Promise.resolve(agent);
            })
    }

}

export default new DialogFlowBot();