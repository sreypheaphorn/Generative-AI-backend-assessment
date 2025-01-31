
import { Request, Response } from "express";
import { ollamaNoStream, ollamaStream } from "../service/ollamaChat";
import { AppDataSource } from "../config";
import { Roadmap } from "../entity/roadmap.entity";
import { UserInfo } from "../entity/user.entity";
import { extractArrayCertificate } from "../utils/extractArrayCertificate"
import { Milestone } from "../entity/milestone.entity";
import { Certificate } from "../entity/certificate.entity";
export const certificate = async (req: Request, res: Response) => {
    const { userId , coursename } = req.body;
    const certificateRepo = AppDataSource.getRepository(Certificate);
    const milestoneRepo = AppDataSource.getRepository(Milestone);
    const userRepo =  AppDataSource.getRepository(UserInfo);


    try {
        const user = await userRepo.findOne({ where: {id: req.user?.id}})
        if(!user){
            return res.status(404).json({
                message: "user not found",
            });
        }
        const certificate = new Certificate()
        certificate.user = userId
        certificate.courseName = coursename
       await certificateRepo.save(certificate)
     
        const qury =`

        You are a helpful coding assistant. I want you to create a exercise quizzes in the form of an array of objects. Each object should contain 3 properties: 
        - 'question': the question base on topic of user input.
        - 'options': 5 options, 4 incorrect answer and for correct answer.
        - 'correctAnswer': the correction answer.

        Your response only be in this format without any other text outside of array:
        [
        {
            "question": "question 1",
            "options": ["option 1", "option 2", "option 3", "option 4", "option 5"] 
            "correctAnswer": "correct option"
        },
        ]

        Now, create a ${ userId } roadmap.
        `
        
        const response = await ollamaNoStream([{role: 'user', content: qury}])
        const milestoneArray = extractArrayCertificate(response.message.content) ?? []

        for(const item of milestoneArray ){
            const milestone = new Milestone()
            // milestone.roadmap = certificate
            milestone.title = item.userID
            milestone.description = item.courseName
         await milestoneRepo.save(milestone)
        }

        res.status(200).json({
            "roadmapId":user.id,
            "title": userId,
            "milestones": milestoneArray
        });

    } catch (error) {
        console.error("Failed to parse quiz JSON array:", error);
        return null;
      }
}


//Get All
export const getcertificate = async (req: Request, res: Response) => {
    try {
        const roadmapRepo = AppDataSource.getRepository(Roadmap);
        const roadmap = await roadmapRepo.find();
        return res.status(200).json({ message: "All roadmap successfully.", data: roadmap});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error fetching data", error: error});
    }
};

 // Get by Id
 export const certificateById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const roadmapRepo = AppDataSource.getRepository(Roadmap);
        const roadMap = await roadmapRepo.findOne({ where: { id } });

        if (!roadMap) {
            return res.status(404).json({ message: "Roadmap not found" });
        }
        return res.status(200).json({ message: "Roadmap successfully.", data: roadMap });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error fetching data", error: error instanceof Error ? error.message : "Unknown error" });
    }
};
//Delete
export const deletecertificate = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const roadmapRepo = AppDataSource.getRepository(Roadmap);
        const roadMap = await roadmapRepo.delete({ id });

        if (roadMap.affected === 0) {
            return res.status(404).json({ message: "Roadmap not found" });
        }
        return res.status(200).json({ message: "Roadmap successfully deleted" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error deleting data", error: error instanceof Error ? error.message : "Unknown error" });
    }
}