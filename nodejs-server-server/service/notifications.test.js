const { MongoClient } = require('mongodb')
const { NotificationsService } = require('./notifications')
const modifyReviewPublishWorkflow = require('./__test__/modify-review-publish.workflow.json')
const editPublishWorkflow = require('./__test__/edit-publish.workflow.json')

describe('NotificationsService', () => {
    let notifications
    let connection
    let db

    beforeAll(async () => {
        // connect to the mock Jest mongo client
        connection = await MongoClient.connect(global.__MONGO_URI__, {
            useNewUrlParser: true,
        })

        db = await connection.db(global.__MONGO_DB_NAME__)

        // setup the notifications service
        notifications = new NotificationsService(db)

        // small helper function to add users to the mock database
        const addUser = async (id, name, roles) => {
            await db.collection('Users').insertOne({ id, name, roles })
        }

        // add some fake users to test with
        addUser('bacon', 'Bacon', [{ model: 'Breakfast', role: 'Author' }])
        addUser('eggs', 'Eggs', [{ model: 'Breakfast', role: 'Author' }])
        addUser('hashbrowns', 'Hashbrowns', [
            { model: 'Breakfast', role: 'Author' },
            { model: 'Breakfast', role: 'Post-Publish Reviewer' },
        ])
        addUser('grits', 'Grits', [
            { model: 'Breakfast', role: 'Author' },
            { model: 'Breakfast', role: 'Post-Publish Reviewer' },
        ])
    })

    afterAll(async () => {
        await connection.close()
    })

    it('getTargetRoles: returns empty array for an invalid state', () => {
        expect(
            notifications.getTargetRoles(modifyReviewPublishWorkflow.edges, 'Foo')
        ).toEqual([])
    })

    it('getTargetRoles: returns Reviewer role for documents in a Modify-Review-Publish workflow that have moved to the Under Review state', () => {
        expect(
            notifications.getTargetRoles(
                modifyReviewPublishWorkflow.edges,
                'Under Review'
            )
        ).toEqual(['Reviewer'])
    })

    it('getTargetRoles: returns Publisher role for documents in a Modify-Review-Publish workflow that have moved to the Published state', () => {
        expect(
            notifications.getTargetRoles(
                modifyReviewPublishWorkflow.edges,
                'Published'
            )
        ).toEqual(['Publisher'])
    })

    it('getTargetRoles: returns Author role for documents in a Modify-Review-Publish workflow that can transition from "Init" state', () => {
        expect(
            notifications.getTargetRoles(modifyReviewPublishWorkflow.edges, 'Init')
        ).toEqual(['Author'])
    })

    it('getTargetRoles: returns Author role for documents in a Edit-Publish workflow that have moved to the Published state', () => {
        expect(
            notifications.getTargetRoles(editPublishWorkflow.edges, 'Published')
        ).toEqual(['Author'])
    })

    it('getTargetRoles: returns the value of "notifyRoles" in the currentEdge', () => {
        expect(
            notifications.getTargetRoles(
                editPublishWorkflow.edges,
                'Published',
                editPublishWorkflow.edges.find(
                    edge =>
                        edge.role == 'Author' &&
                        edge.source == 'Draft' &&
                        edge.target == 'Published'
                )
            )
        ).toEqual(['Post-Publish Reviewer'])
    })

    it('getTargetEdges: returns first edge for initial state', () => {
        expect(
            notifications.getTargetEdges(modifyReviewPublishWorkflow.edges, 'Init')
        ).toEqual([modifyReviewPublishWorkflow.edges[0]])
    })

    it('getTargetEdges: returns empty array for final/end state', () => {
        expect(
            notifications.getTargetEdges(modifyReviewPublishWorkflow.edges, 'Hidden')
        ).toEqual([])
    })

    it('getTargetEdges: returns applicable edges for inner workflow state', () => {
        let targetEdges = notifications.getTargetEdges(
            modifyReviewPublishWorkflow.edges,
            'Under Review'
        )

        // just check the labels for equality
        expect(targetEdges.map(edge => edge.label)).toEqual([
            'Needs more work',
            'Approve publication',
        ])
    })

    it('getUsersWithModelRoles(Breakfast, Author) returns only Breakfast authors', async () => {
        const users = await notifications.getUsersWithModelRoles('Breakfast', [
            'Author',
        ])
        expect(users.sort()).toEqual(['bacon', 'eggs', 'hashbrowns', 'grits'].sort())
    })

    it('getUsersWithModelRoles(Breakfast, Post-Publish Reviewer) returns only Breakfast post publish reviewers', async () => {
        const users = await notifications.getUsersWithModelRoles('Breakfast', [
            'Post-Publish Reviewer',
        ])
        expect(users.sort()).toEqual(['hashbrowns', 'grits'].sort())
    })

    it('getUsersWithModelRoles(Breakfast, [Author, Post-Publish Reviewer]) returns all Breakfast users', async () => {
        const users = await notifications.getUsersWithModelRoles('Breakfast', [
            'Author',
            'Post-Publish Reviewer',
        ])
        expect(users.sort()).toEqual(['bacon', 'eggs', 'hashbrowns', 'grits'].sort())
    })
})