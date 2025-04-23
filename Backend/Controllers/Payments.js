const { instance } = require("../Config/razorpay");
const Course = require("../Models/Course");
const User = require("../Models/User");
const mailSender = require("../utils/mailSender");
const { courseEnrollmentEmail } = require("../mail/templates/courseEnrollmentEmail");

// capture the payment and initiate the payment
exports.capturePayment = async (req, res) => {
    // get courseId & userId
    const { course_id } = req.body;
    const userId = req.user.id;

    // Validation
    // valid courseId
    if (!course_id) {
        return res.json({
            success: false,
            message: "please provide valid course id."
        })
    }

    // valid courseDetails
    let course;
    try {
        course = await Course.findById(course_id);
        if (!course) {
            return res.json({
                success: false,
                message: "please provide valid course id."
            });
        }
        // user already pay for the same course
        const uid = new mongoose.Types.ObjectId(userId);
        if (course.studentsEnrolled.includes(uid)) {
            return res.json({
                success: false,
                message: "You have already enrolled in this course."
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }

    // order create
    const amount = course.price * 100; // in paisa
    const currency = "INR";
    const options = {
        amount: amount, // amount in paisa
        currency: currency,
        receipt: `receipt_${Math.random(Date.now()).toString()}`,
        notes: {
            courseId: course_id,
            userId: userId,
        },
    };

    try {
        // initiate the payment using razorpay
        const paymentResponse = await instance.orders.create(options);
        console.log(paymentResponse);

        // return response
        return res.status(200).json({
            success: true,
            courseName: course.courseName,
            courseDescription: course.courseDescription,
            thumbnail: course.thumbnail,
            orderId: paymentResponse.id,
            currency: paymentResponse.currency,
            amount: paymentResponse.amount,
        });
    } catch (error) {
        console.log(error),
            res.json({
                success: false,
                message: "Could not initiate order",
            })
    }
};

// verify Signature of Razorpay and Server
exports.verifySignature = async (req, res) => {
    const webhookSecret = "12345678";
    const signature = req.header["x-razorpay-signature"];
    let shasum = crypto.createHmac('sha256', webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if (signature == digest) {
        console.log("Payment is Authorized");

        const { courseId, userId } = req.body.payload.payment.entity.notes;

        try {
            // fulfil the action

            // find the course and enroll the student in it
            const enrolledCourse = await Course.findOneAndUpdate(
                { _id: courseId },
                { $push: { studentsEnrolled: userId } },
                { new: true }
            );

            if (!enrolledCourse) {
                return res.status(500).json({
                    success: false,
                    message: "Course not found",
                });
            }
            console.log(enrolledCourse);

            // find the student and add the course to their list enrolled course
            const enrolledStudent = await User.findOneAndUpdate(
                { _id: userId },
                { $push: { courses: courseId } },
                { new: true },
            );
            console.log(enrolledStudent);

            // mail send kardo confirmation wala
            const emailResponse = await mailSender(
                enrolledStudent.email,
                "Congratulations from CodeHelp",
                "Congratulations, you are onborded into new CodeHelp Course",
            );

            console.log(emailResponse);
            return res.status(200).json({
                success: true,
                message: "Signature Verified and Course Added",
            });
            
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    } else {
        return res.status(400).json({
            success: false,
            message: "Invalid Request",
        });
    }
}