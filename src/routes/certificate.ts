import { Router } from "express";
import protectRoute from "../middleware/auth";
import { certificate } from "../controllers/certificate.controller";

const router = Router();

router.post("/create", protectRoute(), certificate);
router.get("/get", protectRoute(), certificate);
router.get("/get/:id", protectRoute(), certificate);
router.delete("/delete", protectRoute(), certificate);




export default router;